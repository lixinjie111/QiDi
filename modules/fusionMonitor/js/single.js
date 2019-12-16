/**
 * 单车
 */

/** 地址管理 **/
let urlConfig = {
    // 获取路侧点位置
    getDevDis: window.config.url+"lc/baseStat/getDevDis",
    // 获取车辆基本信息
    getVehicleBaseData: window.config.url+"singleMoniter/getVehicleBaseData"
};

/** 参数管理 **/
let vehicleId = getQueryVariable("vehicleId");
let delayTime = getQueryVariable("delayTime");
//高德地图参数
let distanceMap = null;
let prevLastPoint = []; //上次请求的终点，
let carStartPoin = [];
let markers = {
    markerStart: null,
    polyline: [],
    markerEnd: null
};
//3d地图参数
let gis3d;
let perceptionCars = new PerceptionCars();
let platCars = new ProcessCarTrack();
let processData = new ProcessData();
let pulseInterval = 40;

/** 调用 **/
$(function() {
    // 获取路侧点位置
    getDevDis();
    // 获取车辆基本信息
    getVehicleBaseData(); 
    // 初始化高德地图
    initMap();  
    // 初始化3D地图
    init3DMap(); 
    // 初始化动态数据
    initWebsocketData();
    // 脉冲实时接口
    initPulseWebSocket();
});

/** 方法 **/
function getDevDis() {
    let _params = JSON.stringify({
            'devTypes': ['2'],
        });
    $.ajax({
        type: "POST",
        dataType: "json",
        cache:false,
        contentType: 'application/json;charset=UTF-8',
        url: urlConfig.getDevDis,
        data: _params,
        success: function(res) {
            // console.log("获取路侧点位置成功",res);
            //初始化感知模型--杆
            GisData.initPoleModelDate(res.data,gis3d.cesium.viewer);
        },
        error: function(err) {
            console.log("获取路侧点位置失败",err);
        }
    })
}
function getVehicleBaseData() {
    let _params = JSON.stringify({
            'vehicleId': vehicleId
        });
    $.ajax({
        type: "POST",
        dataType: "json",
        cache:false,
        contentType: 'application/json;charset=UTF-8',
        url: urlConfig.getVehicleBaseData,
        data: _params,
        success: function(res) {
            // console.log("获取车辆基本信息成功",res);
            if(res.vehicleBaseDetail && res.vehicleBaseDetail.length>0) {
                document.querySelector(".level-num").innerHTML = res.vehicleBaseDetail[0].autoLevel;
                document.querySelector(".vehicle-num").innerHTML = res.vehicleBaseDetail[0].platNo;
                document.querySelector(".vehicle-img").src = res.vehicleBaseDetail[0].vehicleLogo;
            }
        },
        error: function(err) {
            console.log("获取车辆基本信息失败",err);
        }
    })
}
function initMap() {
    distanceMap = new AMap.Map('aMap', window.defaultMapOption);
}
//行程概览--绘制
function drawLine(data){
    let p = ConvertCoord.wgs84togcj02(data.longitude, data.latitude);
    let point = new AMap.LngLat(p[0], p[1]);
    let pointPath = [];
    //绘制第一个点
    if(!markers.markerStart){
        distanceMapStart(point);
    }else{
        //绘制线
        pointPath.push(prevLastPoint);
        pointPath.push(point);
        let polyline = new AMap.Polyline({
                map: distanceMap,
                path: pointPath,
                strokeColor: "#03812e",
                strokeWeight: 2,
                // 折线样式还支持 'dashed'
                strokeStyle: "solid",
                /* // strokeStyle是dashed时有效
                 strokeDasharray: [10, 5],*/
                lineJoin: 'round',
                lineCap: 'round',
                zIndex: 50
            });
        markers.polyline.push(polyline);
        //绘制终点
        distanceMapEnd(point,data.heading);
    }
    prevLastPoint=point;
}
//行程概览--绘制起点
function distanceMapStart(startPoint){
    markers.markerStart = new AMap.Marker({
        position: startPoint,   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
        icon:'./images/start.png',
        offset: new AMap.Pixel(-10, -10)
    });
    // 将创建的点标记添加到已有的地图实例：
    distanceMap.add(markers.markerStart);
    // 缩放地图到合适的视野级别
    distanceMap.setFitView();
}
//行程概览--绘制终点
function distanceMapEnd(point,heading){
    if(!markers.markerEnd) {
        markers.markerEnd = new AMap.Marker({
            position:point,
            icon:'./images/end.png',
            offset: new AMap.Pixel(-20, -10),
            autoRotation: true,
            angle: heading-90
        });
        // 将创建的点标记添加到已有的地图实例：
        distanceMap.add(markers.markerEnd);
    }else{
        markers.markerEnd.setPosition(point);
        markers.markerEnd.setAngle(heading-90);
    }
    // 缩放地图到合适的视野级别
    distanceMap.setFitView();
}
function init3DMap() {
    gis3d = new GIS3D();
    gis3d.initload("cesiumContainer", false);
    let {x, y, z, radius, pitch, yaw} = window.defaultMapParam;
    gis3d.updateCameraPosition(x, y, z, radius, pitch, yaw);

    //初始化地图--道路数据
    GisData.initRoadDate(gis3d.cesium.viewer);
    //初始化地图服务--上帝视角时使用
    GisData.initServer(gis3d.cesium.viewer);
    //初始化模型数据--树
    GisData.initThreeData(gis3d.cesium.viewer);
    //初始化模型--红路灯
    GisData.initLightModel(gis3d.cesium.viewer);
    //初始化模型--红路灯牌
    initLight3D.initlight(gis3d.cesium.viewer);
    // //更新红路灯数据
    // initLight3D.updateLight(light);
}
function initWebsocketData() {
    //初始化车辆步长以及平台车阀域范围
    platCars.stepTime = pulseInterval;
    platCars.pulseInterval = pulseInterval*0.8;//设置阀域范围 脉冲时间的100%
    platCars.platMaxValue = platCars.pulseInterval*1.5;

    perceptionCars.stepTime = pulseInterval;
    perceptionCars.pulseInterval = parseInt(pulseInterval)*0.8;
    perceptionCars.perMaxValue = perceptionCars.pulseInterval*1.5;

    let spatPulse = pulseInterval*30;
    processData.spatPulseInterval = spatPulse*0.8;
    processData.spatMaxValue =  processData.pulseInterval*1.5;

    let routePulse = pulseInterval*25;
    processData.routePulseInterval = routePulse*0.8;
    processData.routeMaxValue =  processData.routePulseInterval*1.5;

    let canPulse = pulseInterval*25;
    processData.canPulseInterval = canPulse*0.8;
    processData.canMaxValue =  processData.canPulseInterval*1.5;

    let warnPulse = pulseInterval*10;
    processData.warnPulseInterval = warnPulse*0.8;
    processData.warnMaxValue = warnPulse*1.5;

    let cancelPulse = pulseInterval;
    processData.cancelPulseInterval = cancelPulse*0.8;
    processData.cancelMaxValue = cancelPulse*1.5; 
}
/** websocket **/
function initPulseWebSocket() {
    
}