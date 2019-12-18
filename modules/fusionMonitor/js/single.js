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
let delayTime = parseFloat(getQueryVariable("delayTime")).toFixed(3)*1000;
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
let gis3d = new GIS3D();
let perceptionCars = new PerceptionCars();
let platCars = new ProcessCarTrack();
let processData = new ProcessData();

let pulseWebsocket = null;
let platformWebsocket = null;
let perceptionWebsocket = null;
let canWebSocket = null;
let spatWebsocket = null;
let warningWebsocket = null;
let cancelWarningWebsocket = null;

let pulseInterval = 20;
let processDataTime = '';
let pulseNowTime = '';
let pulseCount = 0;
let spatPulseCount = 0;
let routePulseCount = 0;
let warningPulseCount = 0;
let staticPulseCount = 0;
let computePulseCount = 0;
let perCount = 0;
let spatCount = 0;
let warningCacheCount = 0;
let staticCacheCount = 0;

let warningData = {};
let warningExist = [];//要进行距离计算
let staticExist = [];//要进行距离计算
let warningCount = 0;//要进行距离计算
let lastLightObj = {};//要进行距离计算
let tabIsExist = true;
let removeWarning = [];

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
    //判断当前标签页是否被隐藏
    document.addEventListener("visibilitychange",visiblityChange);
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
            platCars.sideList = res.data;
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

    perceptionCars.viewer = gis3d.cesium.viewer;
    platCars.viewer = gis3d.cesium.viewer;
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
    let _params = {
            "action":"pulse",
            "data":{
                "frequency":pulseInterval
            }
        };
    pulseWebsocket = new WebSocketObj(window.config.socketUrl, _params, onPulseMessage);
}
function onPulseMessage(message){
    let json = JSON.parse(message.data);
    let result = json.result;
    if(pulseNowTime==''){
        initPlatformWebSocket();
        initPerceptionWebSocket();
        initCanWebSocket();
        initWarningWebSocket();
        initSpatWebSocket();
        initCancelWarningWebSocket();
    }
    pulseNowTime = result.timestamp;
    pulseCount++;

    //缓存的时间
    let pulseNum = delayTime*2/40;
    let _delayTime = delayTime*2*0.6;
    if (Object.keys(platCars.platObj).length > 0) {
        for (let vehicleId in platCars.platObj) {
            let dataList = platCars.platObj[vehicleId];
            if (dataList.length > 0) {
                //分割之前将车辆移动到上一个点
                //将第一个点进行分割
                let data = dataList.shift();
                platCars.cacheAndInterpolatePlatformCar(data);
            }
        }
    }

    //取消告警
    if(processData.cancelWarning.length>0){
        let cancelData = [];
        //查找现有告警是否有取消告警
        processData.cancelWarning.forEach(warnId=>{
            //如果有告警 则进行删除
            if(warningData[warnId]){
                cancelData.push(warnId);
            }
        })
        if(cancelData.length>0){
            processCancelWarn(cancelData);
        }
    }

    //感知数据缓存次数控制
    if(perCount>0){
        perCount++;
    }
    if (Object.keys(perceptionCars.devObj).length > 0) {
        //当有感知数据时
        if(perCount==0){
            perCount++;
        }
        for (let devId in perceptionCars.devObj) {
            let devList = perceptionCars.devObj[devId];
            if (devList.length > 0) {
                //分割之前将车辆移动到上一个点
                //将第一个点进行分割
                let data = devList.shift();
                perceptionCars.cacheAndInterpolatePerCar(data);
            }
        }
    }

    //红绿灯缓存次数控制
    if(spatCount>0){
        spatCount++;
    }
    if(Object.keys(processData.spatObj).length>0){
        if(spatCount==0){
            spatCount++;
        }
    }

    //缓存次数控制
    if(warningCacheCount>0){
        warningCacheCount++;
    }
    //有告警事件开始缓存
    if(Object.keys(processData.dynamicWarning).length>0){
        if(warningCacheCount==0){
            warningCacheCount++;
        }
    }

    //缓存次数控制
    if(staticCacheCount>0){
        staticCacheCount++;
    }
    //有告警事件开始缓存
    if(Object.keys(processData.staticWarning).length>0){
        if(staticCacheCount==0){
            staticCacheCount++;
        }
    }

    let mainCar;
    //平台车  缓存+40ms调用一次
    if(pulseCount>=pulseNum) {
        //当平台车开始插值时，调用其他接口
        processDataTime = result.timestamp-_delayTime;
//                    console.log(pulseCount,pulseCount%3,Object.keys(perceptionCars.devObj).length);
        if(Object.keys(platCars.cacheAndInterpolateDataByVid).length>0){
            let platCar = platCars.processPlatformCarsTrack(result.timestamp,_delayTime);
            if(platCar&&platCar.mainCar){
                mainCar = platCar.mainCar;
            }
        }
        //距离计算次数的控制  1200ms计算一次
        if(computePulseCount==0||computePulseCount>25){
            computePulseCount=1;
            //如果是主车 计算主车与告警事件之间的距离
            if(mainCar){
                //静态事件  查找框内的事件 staticExist  存储静态事件
                let currentExtend = getExtend(mainCar.longitude,mainCar.latitude,0.005);
                if(staticExist.length>0){
                    staticExist.forEach((item,index)=>{
                        if(item.longitude<currentExtend[1][0]&&item.latitude<currentExtend[1][1]&&item.longitude>currentExtend[3][0]&&item.latitude>currentExtend[3][1]){
                            let s = computeDistance(mainCar,item);
                            processWarn(item,s);
                        }else{
                            //如果不在区域内  不显示多少米  排查是否信息更新
                            let msg = gis3d.get3DInfoLabel(item.warnId);
                            if(msg&&msg._value.indexOf('米')!=-1){
                                gis3d.update3DInfoLabel(item.warnId,item.warnMsg);
                            }
                        }
                    })
                }
                //动态事件
                if(warningExist.length>0){
                    warningExist.forEach(item=>{
                        let s = computeDistance(mainCar,item);
                        processWarn(item,s);
                    })
                }
            }
        }
        computePulseCount++;

        if(routePulseCount==0||routePulseCount>=25){
            routePulseCount=1;
            if(mainCar){
                mainCar.tabIsExist = tabIsExist;
                drawLine(mainCar);
            }
            if(processData.canList.length>0){
                let canData = processData.processCanData(result.timestamp,_delayTime);
                if(canData){
                    // 计算can数据
                    document.querySelector(".travel-longitude").innerHTML = canData.longitude.toFixed(8);
                    document.querySelector(".travel-latitude").innerHTML = canData.latitude.toFixed(8);
                    document.querySelector(".travel-speed").innerHTML = canData.speed.toFixed(1);
                    document.querySelector(".travel-heading").innerHTML = canData.headingAngle.toFixed(1);
                    let _gpsTime = TDate.formatTime(canData.gpsTime).split(" ");
                    document.querySelector(".travel-year").innerHTML = _gpsTime[0];
                    document.querySelector(".travel-time").innerHTML = _gpsTime[1];
                    // 方向盘
                    document.querySelector(".arrow-wrap").classList.remove("left");
                    document.querySelector(".arrow-wrap").classList.remove("right");
                    if(canData.turnLight) {
                        document.querySelector(".arrow-wrap").classList.add(canData.turnLight);
                    }
                    // 油门和刹车
                    let _oilLeftWidth = oilLeftWidth(canData.oilDoor);
                    let _brakeLeftWidth = brakeLeftWidth(canData.brakePedal);
                    // console.log("canDada----",canData.oilDoor,canData.brakePedal,canData.turnLight,_oilLeftWidth,_brakeLeftWidth);
                    document.querySelector(".oli-bar").style.left = _oilLeftWidth+"px";
                    document.querySelector(".brake-bar").style.left = _brakeLeftWidth+"px";
                }
            }
        }
        routePulseCount++;
    }

    //感知车 缓存+40ms调用一次
    if(perCount>=pulseNum){
        if(Object.keys(perceptionCars.devObj).length>0){
            let processPerCar = perceptionCars.processPerTrack(result.timestamp,_delayTime);
        }
    }

    //红绿灯  缓存+1200ms调用一次
    if(spatCount>=pulseNum&&(spatPulseCount==0||spatPulseCount>=30)){
        spatPulseCount=1;
        if(Object.keys(processData.spatObj).length>0){
            let spatData = processData.processSpatData(result.timestamp,_delayTime);
            drawnSpat(spatData);
        }
    }
    spatPulseCount++;

    //执行告警
    if(warningCacheCount>pulseNum&&(warningPulseCount==0||warningPulseCount>=10)){
        warningPulseCount=1;
        if(Object.keys(processData.dynamicWarning).length>0){
            warningExist = [];
            for(let warnId in processData.dynamicWarning){
                let data = processData.processWarningData(result.timestamp,_delayTime,warnId);
                if(data){
                    warningExist.push(warnId);
                    processWarn(data);
                }
            }
            if(warningExist.length>0){
                if(Object.keys(warningData).length>0){
                    for(let warnId in warningData){
                        //如果历史告警不存在  进行删除
                        if(warningExist.indexOf(warnId)==-1){
                            delete warningData[warnId];
                            gis3d.remove3DInforLabel(warnId);
                        }
                    }
                }
            }
        }
    }
    warningPulseCount++;

    //执行静态告警
    if(staticCacheCount>pulseNum&&(staticPulseCount==0||staticPulseCount>=10)){
        staticPulseCount=1;
        //静态事件的处理
        if(Object.keys(processData.staticWarning).length>0){
            let staticData = processData.processStaticData(result.timestamp,_delayTime);
            if(staticData&&staticData.length>0){
                staticExist.push.apply(staticExist,staticData);
                //静态事件
                staticData.forEach(item=>{
                    //起始与车的距离计算
                    processWarn(item);
                })
            }
        }
    }
    staticPulseCount++;
}
function oilLeftWidth(data) {
    let oilData = parseFloat(data/100);
    if(oilData==0){
       return 10;
    }
    return parseInt(oilData*80);
}
function brakeLeftWidth(data) {
    let brakeData = parseFloat(data/100);
    if(brakeData==0){
        return 0;
    }
    return parseInt(brakeData*80);
}
function initPlatformWebSocket() {
    let _params = {
                    "action": "vehicle",
                    "body": {
                        "vehicleId": vehicleId
                    },
                    "type": 2
                };
    platformWebsocket = new WebSocketObj(window.config.socketUrl, _params, onPlatformMessage);
}
function onPlatformMessage(message) {
    let json = JSON.parse(message.data);
    platCars.receiveData(json, pulseNowTime, vehicleId);
}
function initPerceptionWebSocket() {
    let _params = {
                    "action": "road_real_data_per",
                    "data": {
                        "type": 2,
                        "vehicleId": vehicleId
                    }
                };
    perceptionWebsocket = new WebSocketObj(window.config.socketUrl, _params, onPerceptionMessage);
}
function onPerceptionMessage(message) {
    let data = JSON.parse(message.data)
    let sideList = data.result.perList;
    perceptionCars.receiveData(sideList);
}
function initCanWebSocket() {
    let _params = {
                    'action': 'can_real_data',
                    'vehicleIds': vehicleId
                };
    canWebSocket = new WebSocketObj(window.config.socketUrl, _params, onCanMessage);
}
function onCanMessage(message) {
    let json = JSON.parse(message.data);
    processData.receiveCanData(json.result);
}
function initWarningWebSocket() {
    let _params = {
                        "action": "warning",
                        "body": {
                            "vehicleId": vehicleId
                        },
                        "type":1
                    };
    warningWebsocket = new WebSocketObj(window.config.socketUrl, _params, onWarningMessage);
}
function onWarningMessage(message) {
    let json = JSON.parse(message.data);
    let data = json.result;
    if(data&&data.length>0){
        data.forEach(rcuItem=>{
            let item = rcuItem.data;
            let warnId = item.warnId.substring(0,item.warnId.lastIndexOf("_"));
            //判断事件是否被取消 如果告警事件被画上 并且接收到取消 则不进行接收
            if(removeWarning.indexOf(item.warnId)==-1){
                //如果是静态事件
                if(!item.isD){
                    //如果是静态事件，收到确认
                    let warning = {
                        "action":"warning",
                        "body":{
                            "warnId": item.warnId,
                            "status":1
                        },
                        "type":2
                    }
                    let warningMsg = JSON.stringify(warning);
                    warningWebsocket.sendMsg(warningMsg);
                    item.warnId = warnId;
                    let array = processData.staticWarning[item.warnId];
                    if(!array){
                        processData.staticWarning[item.warnId] = new Object();
                    }
                    processData.staticWarning[item.warnId]=item;
                }else{
                    let array = processData.dynamicWarning[warnId];
                    if(!array){
                        processData.dynamicWarning[warnId] = new Array();
                    }
                    item.warnId = warnId;
                    processData.dynamicWarning[warnId].push(item);

                }
            }
        });
    }
}
function initSpatWebSocket() {
    let _params = {
                    "action": "spat",
                    "vehicleId": vehicleId,
                    "type": 1
                };
    spatWebsocket = new WebSocketObj(window.config.socketUrl, _params, onSpatMessage);
}
function onSpatMessage(message) {
    let json = JSON.parse(message.data);
    let data = json.result.data;
    processData.receiveLightData(data);
}
function initCancelWarningWebSocket() {
    let _params = {
                    "action": "event_cancel",
                    "body": {},
                    "type": 1
                };
    cancelWarningWebsocket = new WebSocketObj(window.config.socketUrl, _params, onCancelWarningMessage);
}
function onCancelWarningMessage(message) {
    let json = JSON.parse(message.data);
    let warnId = json.result;
    let cancelWarning = {
        "action": "event_cancel",
        "body": {
            "events": warnId,
            "status": 1
        },
        "type":2
    }
    let cancelWarningMsg = JSON.stringify(cancelWarning);
    cancelWarningWebsocket.sendMsg(cancelWarningMsg);
    if(processData.cancelWarning.indexOf(warnId)==-1){
        processData.cancelWarning.push(warnId);
    }
}

function computeDistance(mainCar,warningItem){
    let lat1 = mainCar.latitude;
    let lat2 = warningItem.latitude;
    let lng1 = mainCar.longitude;
    let lng2 = warningItem.longitude;
    let radLat1 = lat1*Math.PI / 180.0;
    let radLat2 = lat2*Math.PI / 180.0;
    let a = radLat1 - radLat2;
    let  b = lng1*Math.PI / 180.0 - lng2*Math.PI / 180.0;
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
        Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
    s = s *6378.137 ;// EARTH_RADIUS;
    s = parseInt(Math.round(s * 10000) / 10);
    return s;
}
function getExtend(x,y,r){
    let currentExtent=[];
    let x0=x+r;
    let y0=y+r;
    let x1=x-r;
    let y1=y-r;
    currentExtent.push([x1, y0]);
    currentExtent.push([x0, y0]);
    currentExtent.push([x0, y1/2]);
    currentExtent.push([x1, y1/2]);
    return currentExtent;
}
function processWarn(warningData,distance){
    let warnId = warningData.warnId;
    let warningMsg;
    if(distance){
        warningMsg = warningData.warnMsg + ' ' +distance+'米';
    }
    //如果告警第一次画
    if(!warningData[warnId]){
        warningCount++;
        warningData[warnId] = {
            warnId: warnId,
            id:warnId,
            warnMsg:warningData.warnMsg,
            longitude:warningData.longitude,
            latitude:warningData.latitude
        }
        gis3d.add3DInfoLabel(warnId,warningMsg,warningData.longitude,warningData.latitude,20);
    }else{
        gis3d.update3DInfoLabel(warnId,warningMsg);
    }
}
function processCancelWarn(data){
    data.forEach(warnId=>{
        if (warningCount > 0) {
            warningCount--;
            $parent.warningCount = warningCount;
            delete warningData[warnId];
            gis3d.remove3DInforLabel(warnId);
            removeWarning.push(warnId);
            staticExist.forEach((item,index)=>{
                if(item.warnId == warnId){
                    staticExist.splice(index,1)
                }
            })
            processData.cancelWarning.splice(processData.cancelWarning.indexOf(warnId),1);
        }
    })
}
function drawnSpat(data){
    let resultData=[];
    if(data&&data.length>0){
        data.forEach(item=>{
            let option={
                leftTime: item.leftTime,
                light: item.light,
                direction: item.direction,
                spatId: item.spatId

            }
            resultData.push(option);
        });
        resultData.forEach(function (item,index,arr) {
            let light={};
            let array=(item.leftTime+"").split("");
            if(array.length==1){
                array=['0',array[0]]
            }
            let img1;
            let img2;
            let img3;
            let lastItem;
            let keys = Object.keys(lastLightObj);
            if(keys&&keys.length>0){
                lastItem = lastLightObj[item.spatId];
            }

            if(!tabIsExist){
                lastItem={};
            }

            let _direction = '';
            if(item.direction==1) {
                _direction = 'cross';
            }
            if(item.direction==2) {
                _direction = 'left';
            }
            if(item.direction==3) {
                _direction = 'turn';
            }
            if(item.direction==4) {
                _direction = 'right';
            }
            let _color = item.light.toLowerCase();
            //每个路灯相位都是固定的
            if(lastItem&&lastItem.light==item.light&&lastItem.direction==item.direction){
                img1="";
            }else{
                img1='./images/light/'+_direction+'-'+_color+'.png';
            }
            if(lastItem&&lastItem.first==array[0]&&lastItem.light==item.light){
                img2=''
            }else {
                img2 = getNumPng(_color,array[0]);
            }
            if(lastItem&&lastItem.second==array[1]&&lastItem.light==item.light){
                img3=''
            }else {
                img3 = getNumPng(_color,array[1]);
            }

            light.id=item.spatId;
            light.img1=img1;
            light.img2=img2;
            light.img3=img3;
            initLight3D.updateLight(light);
            let obj = {
                direction:item.direction, //直行 左转 右转
                light:item.light,
                first:array[0],
                second:array[1]

            }
            lastLightObj[item.spatId]=obj;
        })
    }
}
function getNumPng(color,num){
    let _color = color.toLowerCase();
    let img = './images/light/'+_color+'_'+num+'.png';
    return img;

}
function visiblityChange() {
    if(document.visibilityState == "hidden") {
        tabIsExist=false;
    } else if (document.visibilityState == "visible") {
        tabIsExist=true;
    }
}