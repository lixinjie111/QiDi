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
let gis3d;

/** 调用 **/
$(function() {
    // 初始化地图
    initMap();  
    // 获取路侧点位置
    getDevDis();
    // 获取车辆基本信息
    getVehicleBaseData();
});

/** 方法 **/
function initMap() {
    gis3d = new GIS3D();
    gis3d.initload("cesiumContainer", false);
    gis3d.updateCameraPosition(121.17659986110053,31.28070920407326,39.142101722743725,5.573718449729121,-0.23338301782710902,6.281191529370343);

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
            console.log("成功",res);
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
            console.log("成功",res);
        },
        error: function(err) {
            console.log("失败",err);
        }
    })
}