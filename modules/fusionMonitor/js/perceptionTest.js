/**
 * 路口Test
 */

/** 地址管理 **/
let urlConfig = {
    // 获取摄像头感知区域
    findRSBindDevList: window.config.operateUrl+"openApi/v2x/device/findRSBindDevList"
};

/** 参数管理 **/
let crossId = getQueryVariable("crossId");
let extend = parseFloat(getQueryVariable("extend"));
let longitude=parseFloat(getQueryVariable("lng"));
let latitude=parseFloat(getQueryVariable("lat"));

let currentExtent = getExtend(longitude,latitude,extend);
let center=[longitude ,latitude];
let camParam = window.defaultMapParam;

let nowTime = '';
let nowTimeCount = -1;
let countTimeList = [];
let startGpsTime = '';
let drawCount = -1;
let runTime = 80;
let sectionTime = 55;
let drawObj = {};

//3d地图参数
let gis3d = new GIS3D();
let perceptionCars = new PerceptionCars();

let perceptionWebsocket = null;

/** 调用 **/
$(function() {
    if(top.location == self.location){
        console.log("是顶层窗口");
    }else {
        console.log("不是顶层窗口");
    }
    // 接受数据
    getMessage();
    // 初始化3D地图
    init3DMap();
    // 初始化动态数据
    initPerceptionWebSocket();
    // 上下键绑定事件
    initBindHandle();
});

/** 方法 **/
function findRSBindDevList() {
    let _params = JSON.stringify({
        "rsPtId": crossId,
        "typeList": ["N","S"]
    });
    $.ajax({
        type: "POST",
        dataType: "json",
        cache:false,
        contentType: 'application/json;charset=UTF-8',
        url: urlConfig.findRSBindDevList,
        data: _params,
        success: function(res) {
            let data = res.data; 
            let reg = /\;/g;
            data.forEach(item=>{
                if(item.sensingArea){
                    let area = JSON.parse('['+item.sensingArea.replace(reg, ",")+']');
                    gis3d.addPolygon(area);
                 }
            });
        },
        error: function(err) {
            console.log("获取设备感知区域失败",err);
        }
    })
}
function getMessage() {
    window.addEventListener('message', e => {
        // e.data为父页面发送的数据
        let eventData = e.data;
        if(eventData.type == 'updateSideList') {
            if(eventData.data) {
                platCars.sideList = eventData.data;
                GisData.initPoleModelDate(eventData.data,gis3d.cesium.viewer);
            }else {
                // 获取路侧点位置
                getDevDis();
            }
        }
        if(eventData.type == 'updateCam') {
            if(eventData.data) {
                camParam = eventData.data;
            }
            let {x, y, z, radius, pitch, yaw} = camParam;
            // let {x, y, z, radius, pitch, yaw} = window.defaultMapParam;
            gis3d.updateCameraPosition(x, y, z, radius, pitch, yaw, 5);
        }
        if(eventData.type == 'updatePosition') {
            let _currentExtent = getExtend(longitude,latitude,0.001);
            gis3d.updatePosition(_currentExtent[3][0],_currentExtent[3][1],_currentExtent[1][0],_currentExtent[1][1]);
        }
    });
}
function init3DMap() {
    gis3d.initload("cesiumContainer", false);

    if(top.location == self.location){  
        let {x, y, z, radius, pitch, yaw} = window.defaultMapParam;
        gis3d.updateCameraPosition(x, y, z, radius, pitch, yaw);
    }

    //初始化地图--道路数据
    GisData.initRoadDate(gis3d.cesium.viewer);
    //初始化地图服务--上帝视角时使用
    GisData.initServer(gis3d.cesium.viewer);
    //初始化模型数据--树
    GisData.initThreeData(gis3d.cesium.viewer);

    // 框区域
    gis3d.addRectangle(currentExtent[3][0],currentExtent[3][1],currentExtent[1][0],currentExtent[1][1]);

    perceptionCars.viewer = gis3d.cesium.viewer;

    //获取感知区域
    findRSBindDevList();
}
function initBindHandle() {
    document.addEventListener('keydown',function(event) {
        if(nowTime) {
            drawObj = {};
            var e = event || window.event || arguments.callee.caller.arguments[0];

            if(e && e.keyCode==40){ //下
                console.log("向下");
                drawCount++;
                document.querySelector('.m-time3').innerHTML = TDate.formatTime(startGpsTime+(runTime*drawCount),'yy-mm-dd hh:mm:ss:ms');
                if(Object.keys(perceptionCars.devObj).length>0){
                    perceptionCars.processPerTrack(startGpsTime+(drawCount*runTime));
                    for(let attr in perceptionCars.drawObj) {
                        if(perceptionCars.drawObj[attr].length) {
                            drawObj.attr = {
                                data: perceptionCars.drawObj[attr],
                                gpsTime: perceptionCars.drawObj[attr][0].gpsTime,
                                updateTime: perceptionCars.drawObj[attr][0].updateTime
                            };
                        }
                    }
                }
            }
            if(e && e.keyCode==38){ // 上
                console.log("向上");
                if(drawCount>0) {
                    drawCount--;
                    document.querySelector('.m-time3').innerHTML = TDate.formatTime(startGpsTime+(runTime*drawCount),'yy-mm-dd hh:mm:ss:ms');
                    if(Object.keys(perceptionCars.devObj).length>0){
                        perceptionCars.processPerTrack(startGpsTime+(drawCount*runTime));
                        for(let attr in perceptionCars.drawObj) {
                            if(perceptionCars.drawObj[attr].length) {
                                drawObj.attr = {
                                    data: perceptionCars.drawObj[attr],
                                    gpsTime: perceptionCars.drawObj[attr][0].gpsTime,
                                    updateTime: perceptionCars.drawObj[attr][0].updateTime
                                };
                            }
                        }
                    }
                }
            }
        }
    });
}
function countTime() {
    document.querySelector('.m-time1').innerHTML = processDataTime;
    document.querySelector('.m-time2').innerHTML = processDataTime;
    document.querySelector('.m-time3').innerHTML = processDataTime;
} 
function initPerceptionWebSocket() {
    let _params = {
        "action":"road_real_data_per",
        "data":{
            "type":1,
            "polygon":currentExtent
        }
    };
    perceptionWebsocket = new WebSocketObj(window.config.socketUrl, _params, onPerceptionMessage);
}
function onPerceptionMessage(message) {
    if(nowTimeCount < 1000) {
        let data = JSON.parse(message.data);
        let sideList = data.result.perList;
        perceptionCars.receiveData(sideList);
        if(!startGpsTime && sideList.length > 0) {
            startGpsTime = sideList[0].gpsTime;
            document.querySelector('.m-time2').innerHTML = TDate.formatTime(startGpsTime,'yy-mm-dd hh:mm:ss:ms');
        }
        nowTime = data.time;
        document.querySelector('.c-loading-wrap').style.display = 'none';
        document.querySelector('.m-time1').innerHTML = TDate.formatTime(nowTime,'yy-mm-dd hh:mm:ss:ms');
        nowTimeCount ++;
        countTimeList.push(data.time);
    }else {
        perceptionWebsocket&&perceptionWebsocket.webSocket.close();
    }
}
function getExtend(x,y,r){
    let currentExtent=[];
    let x0=x+r;
    let y0=y+r;
    let x1=x-r;
    let y1=y-r;
    currentExtent.push([x1, y0]);
    currentExtent.push([x0, y0]);
    currentExtent.push([x0, y1]);
    currentExtent.push([x1, y1]);
    return currentExtent;
}
