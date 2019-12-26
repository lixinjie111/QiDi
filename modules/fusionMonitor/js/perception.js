/**
 * 路口
 */

/** 地址管理 **/
let urlConfig = {
    // 获取路侧点位置
    getDevDis: window.config.url+"lc/baseStat/getDevDis",
    // 获取标识牌和红绿灯信息 "type": "signs,spats,lampPole"
    // typeRoadData: window.config.url+"ehb/road/typeRoadData",
    // 获取摄像头感知区域
    findRSBindDevList: window.config.url+"openApi/v2x/device/findRSBindDevList"
};

/** 参数管理 **/
let crossId = getQueryVariable("crossId");
let delayTime = parseFloat(getQueryVariable("delayTime")).toFixed(3)*1000;
let extend = parseFloat(getQueryVariable("extend"));
let longitude=parseFloat(getQueryVariable("lng"));
let latitude=parseFloat(getQueryVariable("lat"));

let currentExtent = getExtend(longitude,latitude,extend);
let center=[longitude ,latitude];
let camParam = window.defaultMapParam;

//3d地图参数
let gis3d = new GIS3D();
let perceptionCars = new PerceptionCars();
let platCars = new ProcessCarTrack();
let processData = new ProcessData();

let pulseWebsocket = null;
let platformWebsocket = null;
let perceptionWebsocket = null;
let spatWebsocket = null;
let warningWebsocket = null;
let cancelWarningWebsocket = null;

let pulseInterval = 40;
let processDataTime = '';
let pulseNowTime = '';
let pulseCount = 0;
let spatPulseCount = 0;
let warningPulseCount = 0;
let staticPulseCount = 0;
let perPulseCount = 0;
let perCacheCount = 0;
let warningCacheCount = 0;
let staticCacheCount = 0;

let warningData = {};
let warningCount = 0;//要进行距离计算
let lastLightObj = {};//要进行距离计算
let tabIsExist = true;
let removeWarning = [];

/** 调用 **/
$(function() {
    if(top.location == self.location){
        console.log("是顶层窗口");
        // 获取路侧点位置
        getDevDis();
        // 获取标识牌和红绿灯信息
        // typeRoadData();
    }else {
        console.log("不是顶层窗口");
    }
    //获取感知区域
    findRSBindDevList();
    // 接受数据
    getMessage();
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
            let sensingArea = [];
            let startArea = [];
            let area = "";
            data.forEach(item=>{
                if(item.sensingArea!=''){
                    let area = item.sensingArea.split(";");
                    if(startArea.length<=0){
                        startArea=area[0];
                    }
                    sensingArea.push.apply(sensingArea,area);
                 }
            });
            if(startArea){
                sensingArea.forEach(item=>{
                    area=area+item+",";
                })
                area = area+startArea;
            }
            GisData.addPolygon(area,0.1);
        },
        error: function(err) {
            console.log("获取设备感知区域失败",err);
        }
    })
}
// function typeRoadData() {
//     let _params = JSON.stringify({
//             "polygon":window.currentExtent,
//             "type": "lampPole,spats"
//         });
//     $.ajax({
//         type: "POST",
//         dataType: "json",
//         cache:false,
//         contentType: 'application/json;charset=UTF-8',
//         url: urlConfig.typeRoadData,
//         data: _params,
//         success: function(res) {
//             // console.log("获取标识牌和红绿灯信息成功",res);
//             let _data = res.data;
//             if(_data.lampPole && _data.lampPole.length) {
//                 //设置--红路灯杆
//                 // GisData.initLightModel(gis3d.cesium.viewer, _data.lampPole);
//             }
//             if(_data.spats && _data.spats.length) {
//                 //设置--红绿灯
//                 // initLight3D.initlight(gis3d.cesium.viewer, _data.spats);
//             }
//             // if(_data.signs && _data.signs.length) {
//             //     //设置--标识牌
//             // }
//         },
//         error: function(err) {
//             console.log("获取标识牌和红绿灯信息失败",err);
//         }
//     })
// }
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
        // if(eventData.type == 'updateLampPoleList') {
        //     if(eventData.data) {
        //         let _data = eventData.data;
        //         if(_data.lampPole && _data.lampPole.length) {
        //             //设置--红路灯杆
        //             // GisData.initLightModel(gis3d.cesium.viewer, _data.lampPole);
        //         }
        //         if(_data.spats && _data.spats.length) {
        //             //设置--红绿灯
        //             // initLight3D.initlight(gis3d.cesium.viewer, _data.spats);
        //         }
        //         // if(_data.signs && _data.signs.length) {
        //         //     //设置--标识牌
        //         // }
        //     }else {
        //         // 获取标识牌和红绿灯信息
        //         typeRoadData();
        //     }
        // }
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

    // 框区域
    gis3d.addRectangle(currentExtent[3][0],currentExtent[3][1],currentExtent[1][0],currentExtent[1][1]);

    perceptionCars.viewer = gis3d.cesium.viewer;
    platCars.viewer = gis3d.cesium.viewer;
}
function initWebsocketData() {
    //初始化车辆步长以及平台车阀域范围
    platCars.stepTime = pulseInterval;
    platCars.pulseInterval = pulseInterval*0.8;//设置阀域范围 脉冲时间的100%
    platCars.platMaxValue = pulseInterval*1.5;

    perceptionCars.stepTime = pulseInterval*2;
    perceptionCars.pulseInterval = parseInt(pulseInterval)*2*0.8;
    perceptionCars.perMaxValue = pulseInterval*2*1.5;

    let spatPulse = pulseInterval*10;
    processData.pulseInterval = spatPulse*0.8;
    processData.spatMaxValue =  spatPulse*1.5;

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
        initWarningWebSocket();
        initSpatWebSocket();
        initCancelWarningWebSocket();
    }
    pulseNowTime = result.timestamp;
    pulseCount++;

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
    //静态事件缓存次数控制
    if(staticCacheCount>0){
        staticCacheCount++;
    }
    //感知车缓存次数控制
    if(perCacheCount>0){
        perCacheCount++;
    }
    //静态告警事件开始缓存
    if(Object.keys(processData.staticWarning).length>0){
        if(staticCacheCount==0){
            staticCacheCount++;
        }
    }

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
    if (Object.keys(perceptionCars.devObj).length > 0){
        if(perCacheCount==0){
            perCacheCount++;
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
    //缓存的时间
    let pulseNum = delayTime*2/40;
    if(pulseCount>=pulseNum) {

        //当平台车开始插值时，调用其他接口
        // processDataTime = result.timestamp-delayTime;
        processDataTime = TDate.formatTime(result.timestamp-delayTime,'yy-mm-dd hh:mm:ss:ms');
        document.querySelector('.c-pulse-time').innerHTML = processDataTime;
        //平台车
        if(Object.keys(platCars.cacheAndInterpolateDataByVid).length>0){
           let platCar =  platCars.processPlatformCarsTrack(result.timestamp,delayTime);
           if(platCar){
                let _camData = {
                    isParent: true,
                    type: 'vehData',
                    data: platCar['vehData']
                }
                parent.postMessage(_camData,"*");
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

        //每隔80ms一次
        if(spatPulseCount==0||spatPulseCount>=10){
            spatPulseCount=1;
            if(Object.keys(processData.spatObj).length>0){
                let data = processData.processSpatData(result.timestamp,delayTime);
                if(data&&data.length>0){
                    drawnSpat(data);
                }
            }
        }
        spatPulseCount++;

    }

    if(perCacheCount>pulseNum&&perPulseCount==0||perPulseCount>=2){
        perPulseCount=1;
        if(Object.keys(perceptionCars.devObj).length>0){
            let perList = perceptionCars.processPerTrack(result.timestamp,delayTime);
            if(perList){
                if(perList.length>0){
                    processPerData(perList[0]);
                    let pernum = 0;
                    let persons = 0;
                    let nonNum = 0;
                    let perData={};
                    perList.forEach(item=>{
                        let cars = item.data;
                        if(cars&&cars.length>0) {
                            for (let i = 0; i < cars.length; i++) {
                                let obj = cars[i];
                                if (obj.targetType == 0){
                                    persons++;
                                }

                                if (obj.targetType == 2||obj.targetType == 5 || obj.targetType == 7) {
                                    pernum++;
                                }

                                if(obj.targetType == 1 || obj.targetType == 3){
                                    nonNum++;
                                }
                            }
                        }
                    });
                    perData['veh']=pernum;
                    perData['person'] = persons;
                    perData['noMotor'] = nonNum;
                    let _camData = {
                        isParent: true,
                        type: 'perceptionData',
                        data: perData
                    }
                    parent.postMessage(_camData,"*");
                }
            }
        }
    }
    perPulseCount++

    //执行动态告警
    if(warningCacheCount>pulseNum&&(warningPulseCount==0||warningPulseCount>=10)){
        warningPulseCount=1;
        if(Object.keys(processData.dynamicWarning).length>0){
            for(let warnId in processData.dynamicWarning){
                let data = processData.processWarningData(result.timestamp,delayTime,warnId);
                if(data){
                    processWarn(data);
                }
            }
            //此次告警结束，将总数传递出去
            let _camData = {
                isParent: true,
                type: 'warningCount',
                data: warningCount
            }
            parent.postMessage(_camData,"*");
        }
    }
    warningPulseCount++;

    //执行静态告警
    if(staticCacheCount>pulseNum&&(staticPulseCount==0||staticPulseCount>=10)){
        staticPulseCount=1;
        //静态事件的处理
        if(Object.keys(processData.staticWarning).length>0){
            for(let warnId in processData.staticWarning){
                let staticData = processData.processStaticData(result.timestamp,delayTime);
                if(staticData&&staticData.length>0){
                    console.log("length:"+staticData.length)
                    //静态事件
                    staticData.forEach(item=>{
                        processWarn(item);
                    })
                }
            }
            //此次告警结束，将总数传递出去
            let _camData = {
                isParent: true,
                type: 'warningCount',
                data: warningCount
            }
            parent.postMessage(_camData,"*");
        }
    }
    staticPulseCount++;
}
function initPlatformWebSocket() {
    let _params = {
        "action": "vehicle",
        "body": {
            "polygon": window.currentExtent
        },
        "type": 3
    };
    platformWebsocket = new WebSocketObj(window.config.socketUrl, _params, onPlatformMessage);
}
function onPlatformMessage(message) {
    let json = JSON.parse(message.data);
    platCars.receiveData(json, pulseNowTime);
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
    let data = JSON.parse(message.data)
    let sideList = data.result.perList;
    perceptionCars.receiveData(sideList);
}
function initWarningWebSocket() {
    let _params = {
        "action":"cloud_event",
        "body":{
            "region":window.currentExtent,
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
        "action":"spat",
        "data":{
            "polygon":window.currentExtent
        },
        "type":2
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
                    "action":"event_cancel",
                    "body":{"busType":"rsi"},
                    "type":1
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
function processPerData(data){
    let cars = data.data;
    if(cars.length>0) {
        let pcarnum = 0;
        let persons = 0;
        let zcarnum = 0;
        for (let i = 0; i < cars.length; i++) {
            let obj = cars[i];
            if (obj.type == 1) {
                zcarnum++;
                continue;
            }
            if (
                obj.targetType == 0 ||
                obj.targetType == 1 ||
                obj.targetType == 3
            ) {
                persons++;
            } else {
                pcarnum++;
            }
        }
        let _camData = {
            type: 'statisticData',
            data: "当前数据包：" + cars.length + "=" + zcarnum + "(平台车)+" + pcarnum + "(感知)+" + persons + "(人)"
        }
        parent.postMessage(_camData,"*");
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
function processWarn(warningData){
    let warnId = warningData.warnId;
    if(warnId){
        //如果告警第一次画
        if(!warningData[warnId]){
            console.log(warnId);
            warningCount++;
            warningData[warnId] = {
                warnId: warnId,
                id:warnId,
                msg:warningData.warnMsg,
                longitude:warningData.longitude,
                latitude:warningData.latitude
            }
            gis3d.add3DInfoLabel(warnId,warningData.warnMsg,warningData.longitude,warningData.latitude,20);
        }else{
            //判断是否需要更新
            if(warningData.longitude != warningData[warnId].longitude || warningData.latitude != warningData[warnId].latitude) {
                gis3d.update3DInfoLabel(warnId,warningData.warnMsg);
            }
        }
    }
}
function processCancelWarn(data){
    data.forEach(warnId=>{
        if (warningCount > 0) {
            warningCount--;

            let _camData = {
                isParent: true,
                type: 'warningCount',
                data: warningCount
            }
            parent.postMessage(_camData,"*");

            delete warningData[warnId];
            console.log("移除事件"+warnId)
            gis3d.remove3DInforLabel(warnId);
            removeWarning.push(warnId);
            delete processData.cancelWarning[warnId];
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