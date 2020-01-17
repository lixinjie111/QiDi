/**
 * 路口
 */

/** 地址管理 **/
let urlConfig = {
    // 获取路侧点位置
    getDevDis: window.config.url+"lc/baseStat/getDevDis",
    // 获取标识牌和红绿灯信息 "type": "signs,spats,lampPole"
    typeRoadData: window.config.url+"ehb/road/typeRoadData",
    // 获取摄像头感知区域
    findRSBindDevList: window.config.operateUrl+"openApi/v2x/device/findRSBindDevList"
};

/** 参数管理 **/
let crossId = getQueryVariable("crossId");
let delayTime = parseFloat(getQueryVariable("delayTime")).toFixed(3)*1000;
let extend = parseFloat(getQueryVariable("extend"));
let longitude=parseFloat(getQueryVariable("lng"));
let latitude=parseFloat(getQueryVariable("lat"));
let isShowMapElement=getQueryVariable("isShowMapElement") == 'true' ? true : false;

let currentExtent = getExtend(longitude,latitude,extend);
let perExtent = getExtend(longitude,latitude,window.extend);
let center=[longitude ,latitude];
let camParam = window.defaultMapParam;

//3d地图参数
let gis3d = new GIS3D();
let perceptionCars = new PerceptionCars();
let platformCars = new ProcessCarTrack();
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

//是否显示该图层
let platformShow = true;
let perceptionShow = true;
let warningShow = true;
let roadsidePointsShow = true;
let spatShow = true;

let platEchartNum = 0;
let platEchartCount = 25;
let perceptionEchartNum = 0;
let perceptionEchartCount =15;
let spatEchartNum = 0;
let spatEchartCount = 15;

//统一循环数量
let warning = 0;
let spat = 0;
let per = 0;

let warningData = {};
let warningCount = 0;//要进行距离计算
let lastLightObj = {};//要进行距离计算
let tabIsExist = true;
let removeWarning = [];

/** 调用 **/
$(function() {
    // 初始化3D地图
    init3DMap();
    if(top.location == self.location){
        // console.log("是顶层窗口");
        // 获取路侧点位置
        getDevDis();
    }else {
        // console.log("不是顶层窗口");
    }
    // 获取标识牌和红绿灯信息
    typeRoadData();
    // 接受数据
    getMessage();
    // 发送地图click事件
    sendMessage();
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
            platformCars.sideList = res.data;
            GisData.initPoleModelDate(res.data,gis3d.cesium.viewer, roadsidePointsShow);
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
function typeRoadData() {
    let _params = JSON.stringify({
            "polygon":perExtent,
            "type": "signs,lampPole"
        });
    $.ajax({
        type: "POST",
        dataType: "json",
        cache:false,
        contentType: 'application/json;charset=UTF-8',
        url: urlConfig.typeRoadData,
        data: _params,
        success: function(res) {
            // console.log("获取标识牌和红绿灯信息成功",res);
            let _data = res.data;
            if(_data.lampPole && _data.lampPole.length) {
                //设置--红路灯杆
                initLight3D.initlight(gis3d.cesium.viewer, _data.lampPole, spatShow);
            }
            // if(_data.signs && _data.signs.length) {
            //     //设置--标识牌
            // }
        },
        error: function(err) {
            console.log("获取标识牌和红绿灯信息失败",err);
        }
    })
}
function getMessage() {
    window.addEventListener('message', e => {
        // e.data为父页面发送的数据
        let eventData = e.data;
        if(eventData.type == 'updateSideList') {
            if(eventData.data) {
                platformCars.sideList = eventData.data;
                GisData.initPoleModelDate(eventData.data,gis3d.cesium.viewer, roadsidePointsShow);
            }else {
                // 获取路侧点位置
                getDevDis();
            }
        }
        if(eventData.type == 'updateCam') {
            if(eventData.data) {
                camParam = eventData.data;
                let {x, y, z, radius, pitch, yaw} = camParam;
                // let {x, y, z, radius, pitch, yaw} = window.defaultMapParam;
                gis3d.updateCameraPosition(x, y, z, radius, pitch, yaw, eventData.animationZ);
            }
        }
        if(eventData.type == 'updatePosition') {
            let _currentExtent = getExtend(longitude,latitude,0.001);
            gis3d.updatePosition(_currentExtent);
        }
        // 显示及隐藏图层
        // platform 联网数据
        // perception 感知数据
        // warning 预警信息
        // roadsidePoints 路侧点
        // spat 信号灯
        // console.log(eventData);
        if(eventData.type == 'platform') {
            platformShow = eventData.flag;
        }
        if(eventData.type == 'perception') {
            perceptionShow = eventData.flag;
        }
        if(eventData.type == 'warning') {
            warningShow = eventData.flag;
            GisUtils.isShowEvents(gis3d.cesium.viewer, warningShow);
        }
        if(eventData.type == 'roadsidePoints') {
            roadsidePointsShow = eventData.flag;
            GisUtils.isShowPole(gis3d.cesium.viewer, roadsidePointsShow);
        }
        if(eventData.type == 'spat') {
            spatShow = eventData.flag;
            GisUtils.isShowLights(gis3d.cesium.viewer, spatShow);
        }
    });
}
function sendMessage(){
    document.getElementById('cesiumContainer').onclick  = function(){
        let msg = {
            type:'mapClick',
            data: '',
        }
        parent.postMessage(msg,"*");
    }
}
function init3DMap() {
    gis3d.initload("cesiumContainer", false);  
    //初始化地图--道路数据
    GisData.initRoadDate(gis3d.cesium.viewer);
    //初始化地图服务--上帝视角时使用
    GisData.initServer(gis3d.cesium.viewer);
    if(isShowMapElement) {
        //初始化模型数据--树
        GisData.initThreeData(gis3d.cesium.viewer);
    }
    // //初始化模型--红路灯
    // GisData.initLightModel(gis3d.cesium.viewer);
    // //初始化模型--红路灯牌
    // initLight3D.initlight(gis3d.cesium.viewer);

    // 框区域
    gis3d.addRectangle('rectangleOne', currentExtent);
    gis3d.addRectangle('rectangleTwo', perExtent, "#ffffff", 0);

    perceptionCars.viewer = gis3d.cesium.viewer;
    platformCars.viewer = gis3d.cesium.viewer;

    if(top.location == self.location){  
        let {x, y, z, radius, pitch, yaw} = window.defaultMapParam;
        gis3d.updateCameraPosition(x, y, z, radius, pitch, yaw);
    }

    //获取感知区域
    findRSBindDevList();
}
function initWebsocketData() {
    //初始化车辆步长以及平台车阀域范围
    platformCars.stepTime = pulseInterval;
    platformCars.pulseInterval = pulseInterval*0.8;//设置阀域范围 脉冲时间的100%
    platformCars.platMaxValue = pulseInterval*1.5;

    let perPulse = 80;
    perceptionCars.stepTime = perPulse;
    perceptionCars.pulseInterval = perPulse*0.8;
    perceptionCars.perMaxValue = perPulse*1.5;
    per = perPulse/pulseInterval;    //默认2

    let spatPulse = 400;
    processData.spatPulseInterval = spatPulse*0.8;
    processData.spatMaxValue =  spatPulse*1.5;
    spat = spatPulse/pulseInterval;  //默认10

    let warnPulse = 400;
    processData.warnPulseInterval = warnPulse*0.8;
    processData.warnMaxValue = warnPulse*1.5;
    warning = warnPulse/pulseInterval;  //默认10
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

    if (Object.keys(platformCars.platObj).length > 0) {
        for (let vehicleId in platformCars.platObj) {
            let dataList = platformCars.platObj[vehicleId];
            if (dataList.length > 0){
                //分割之前将车辆移动到上一个点
                //将第一个点进行分割
                let data = dataList.shift();
                platformCars.cacheAndInterpolatePlatformCar(data);
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
    let pulseNum = delayTime/40;
    let platCars;
    if(pulseCount>pulseNum) {
        //当平台车开始插值时，调用其他接口
        // processDataTime = result.timestamp-delayTime;
        let processTime = result.timestamp-delayTime;
        processDataTime = TDate.formatTime(processTime,'yy-mm-dd hh:mm:ss:ms');
        document.querySelector('.c-pulse-time').innerHTML = processDataTime;

        //平台车
        if(Object.keys(platformCars.cacheAndInterpolateDataByVid).length>0) {
            platCars = platformCars.processPlatformCarsTrack(result.timestamp, delayTime, platformShow);
            // console.log("平台车列表");
            // console.log(platCars.platCars);
            // console.log(platCars);
            if(platEchartNum < platEchartCount) {
                platEchartNum++; 
            }else {
                if(!platCars || !platCars.platCars.length) {
                    platEchartNum = platEchartCount;
                }else {
                    platEchartNum = 0;

                    let _platCarsList = {
                        type: 'platCarsList',
                        data: platCars
                    }
                    parent.postMessage(_platCarsList,"*");
                }
            }
        }

        //感知车
        if(perCacheCount>pulseNum&&(perPulseCount==0||perPulseCount>per)){
            perPulseCount=1;
            if(Object.keys(perceptionCars.devObj).length>0){
                let platFusionList=[];
                if(platCars){
                    platFusionList = platCars.platCars;
                }
                let obj = perceptionCars.processPerTrack(result.timestamp, delayTime, platFusionList);
                // console.log("感知车列表");
                // console.log(obj.perList);

                let _perCarList = {
                    type: 'perCarList',
                    data: []
                }
                
                if(obj){
                    let perCars = obj.perList;
                    _perCarList.data = perCars;
                    //保留两帧数据
                    if(platformCars.fusionList.length>0){
                        let tempList = [];
                        for(let i=0;i<platformCars.fusionList.length;i++){
                            let isExist = false;
                            let vehicleId = platformCars.fusionList[i].vehicleId;
                            if(obj.platFusionList.length>0){
                                for(let j=0;j<obj.platFusionList.length;j++){
                                    if(platformCars.fusionList[i].vehicleId==obj.platFusionList[j].vehicleId){
                                        isExist=true;
                                        break
                                    }
                                }
                            }
                            // console.log(vehicleId,isExist)
                            //找到需要保留的帧
                            if(!isExist){
                                // console.log(platformCars.vehCountObj[vehicleId])
                                //上次存在，这次不存在,则保留一帧
                                if(typeof platformCars.vehCountObj[vehicleId]=='undefined'){
                                    platformCars.vehCountObj[vehicleId]=0;
                                    tempList.push(platformCars.fusionList[i]);
                                    // console.log("保留第一帧：",vehicleId,platformCars.vehCountObj[vehicleId])
                                }else{
                                    platformCars.vehCountObj[vehicleId]++;
                                    //保留两帧中的第二帧
                                    if(platformCars.vehCountObj[vehicleId]<window.frames){
                                        tempList.push(platformCars.fusionList[i]);
                                        // console.log("保留第二帧：",vehicleId,platformCars.vehCountObj[vehicleId])
                                    }else{
                                        // console.log("删除：",vehicleId,platformCars.vehCountObj[vehicleId])
                                        delete platformCars.vehCountObj[vehicleId];
                                    }
                                }
                            }
                        }
                        if(obj.platFusionList.length>0){
                            obj.platFusionList.forEach(item=>{
                                tempList.push(item);
                            })
                        }
                        platformCars.fusionList = tempList;
                    }else{
                        platformCars.fusionList = obj.platFusionList;
                    }

                    if(perCars&&perCars.length>0){
                        //绘制感知车
                        perceptionCars.processPerceptionMesage(perCars, false, perceptionShow, isShowMapElement);
                        let pernum = 0;
                        let perCarNum = 0;
                        let perBusNum = 0;
                        let perTruckNum = 0;
                        let persons = 0;
                        let nonNum = 0;
                        let perData={};
                        //绘制感知车辆的计数 0:人，1:自行车，2:汽车，3:摩托车，5:公共汽车，7:卡车
                        for (let i = 0; i < perCars.length; i++){
                            let obj = perCars[i];
                            if (obj.targetType == 0){   // 人
                                persons++;
                            }

                            if (obj.targetType == 2||obj.targetType == 5 || obj.targetType == 7){  // 机动车
                                pernum++;
                                if (obj.targetType == 2){  // 汽车
                                    perCarNum++;
                                }
                                if (obj.targetType == 5){  // 公共汽车
                                    perBusNum++;
                                }
                                if (obj.targetType == 7){  // 卡车
                                    perTruckNum++;
                                }
                            }

                            if(obj.targetType == 1 || obj.targetType == 3){  // 非机动车
                                nonNum++;
                            }
                        }

                        //融合车辆的计数
                        let perFusionCars = obj.perFusionCars;
                        let fusionPernum = 0;
                        let fusionPerCarNum = 0;
                        let fusionPerBusNum = 0;
                        let fusionPerTruckNum = 0;
                        let fusionPersons = 0;
                        let fusionNonNum = 0;
                        if(perFusionCars.length>0){
                            // console.log("-----------------------");
                            // console.log(obj);
                            //判断的融合的类型
                            perFusionCars.forEach(item=>{
                                if (item.targetType == 0){   // 人
                                    fusionPersons++;
                                }

                                if (item.targetType == 2||item.targetType == 5 || item.targetType == 7){  // 机动车
                                    fusionPernum++;
                                    if (item.targetType == 2){  // 汽车
                                        fusionPerCarNum++;
                                    }
                                    if (item.targetType == 5){  // 公共汽车
                                        fusionPerBusNum++;
                                    }
                                    if (item.targetType == 7){  // 卡车
                                        fusionPerTruckNum++;
                                    }
                                }

                                if(item.targetType == 1 || item.targetType == 3){   // 非机动车
                                    fusionNonNum++;
                                }
                            })
                        }
                        perData['fusionVeh'] = fusionPernum;
                        perData['fusionPerson'] = fusionPersons;
                        perData['fusionNoMotor'] = fusionNonNum;
                        perData['platFusionList'] = obj.platFusionList;

                        perData['veh']= pernum + fusionPernum;
                        perData['person'] = persons + fusionPersons;
                        perData['noMotor'] = nonNum + fusionNonNum;
                        perData['car'] = perCarNum + fusionPerCarNum;
                        perData['bus'] = perBusNum + fusionPerBusNum;
                        perData['truck'] = perTruckNum + fusionPerTruckNum;

                        let _camData = {
                            type: 'perceptionData',
                            data: perData
                        }
                        parent.postMessage(_camData,"*");
                    }
                }

                parent.postMessage(_perCarList,"*");

                if(perceptionEchartNum < perceptionEchartCount) {
                    perceptionEchartNum++; 
                }else {
                    if(!_perCarList.data || !_perCarList.data.length) {
                        perceptionEchartNum = perceptionEchartCount;
                    }else {
                        perceptionEchartNum = 0;

                        let _perceptionCarsList = {
                            type: 'perceptionCarsList',
                            data: _perCarList.data
                        }
                        parent.postMessage(_perceptionCarsList,"*");
                    }
                }
            }
        }
        perPulseCount++;

        //融合后结果
        if (platCars){
            let carList = platCars.platCars; //所有的平台车
            if(platformCars.fusionList&&platformCars.fusionList.length>0){ //需要融合的平台车辆
                platformCars.fusionList.forEach(item=>{
                    carList.forEach(carItem=>{
                        if(carItem.vehicleId==item.vehicleId){
                            carItem.isFusion=true;

                            // console.log("vehicleId:",carItem.vehicleId)
                        }
                    })
                })
            }
            platformCars.moveCars(carList, platformShow, roadsidePointsShow, isShowMapElement);
        }
        //取消告警
        if(Object.keys(processData.cancelWarning).length>0){
            let cancelData = [];
            //查找现有告警是否有取消告警
            for(let warnId in processData.cancelWarning){
                // console.log(processData.cancelWarning[warnId],processTime)
                if(warningData[warnId]&&processData.cancelWarning[warnId].time<=processTime){
                    cancelData.push(warnId);
                }
            }
            if(cancelData.length>0){
                processCancelWarn(cancelData);
            }
        }

        //每隔400ms一次
        if(spatPulseCount==0||spatPulseCount>spat){
            spatPulseCount=1;
            if(Object.keys(processData.spatObj).length>0){
                let data = processData.processSpatData(result.timestamp,delayTime);
                console.log("红绿灯数据--------");
                console.log(data);

                if(spatEchartNum < spatEchartCount) {
                    spatEchartNum++; 
                }else {
                    if(!data || !data.length) {
                        spatEchartNum = spatEchartCount;
                    }else {
                        spatEchartNum = 0;

                        let _spatList = {
                            type: 'spatList',
                            data: data || []
                        }
                        parent.postMessage(_spatList,"*");
                    }
                }

                if(data&&data.length>0){
                    drawnSpat(data);
                }
            }

        }
        spatPulseCount++;

    }

    //执行动态告警
    if(warningCacheCount>pulseNum&&(warningPulseCount==0||warningPulseCount>warning)){
        warningPulseCount=1;
        if(Object.keys(processData.dynamicWarning).length>0){
            for(let warnId in processData.dynamicWarning){
                let data = processData.processWarningData(result.timestamp,delayTime,warnId);
                if(data){
                    processWarn(data);
                }
            }
        }
    }
    warningPulseCount++;

    //执行静态告警
    if(staticCacheCount>pulseNum&&(staticPulseCount==0||staticPulseCount>warning)){
        staticPulseCount=1;
        //静态事件的处理
        if(Object.keys(processData.staticWarning).length>0){
            for(let warnId in processData.staticWarning){
                let staticData = processData.processStaticData(result.timestamp,delayTime);
                if(staticData&&staticData.length>0){
                    //静态事件
                    staticData.forEach(item=>{
                        processWarn(item);
                    })
                }
            }
        }
    }
    staticPulseCount++;

}
function initPlatformWebSocket() {
    let _params = {
        "action": "vehicle",
        "body": {
            "polygon": perExtent
        },
        "type": 3
    };
    platformWebsocket = new WebSocketObj(window.config.socketUrl, _params, onPlatformMessage);
}
function onPlatformMessage(message) {
    let json = JSON.parse(message.data);
    platformCars.receiveData(json, pulseNowTime);
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
function shutDown(){
    perceptionWebsocket&&perceptionWebsocket.webSocket.close();
    platformWebsocket&&platformWebsocket.webSocket.close();
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
            "region":perExtent,
        },
        "type":1
    };
    warningWebsocket = new WebSocketObj(window.config.testUrl, _params, onWarningMessage);
}
function onWarningMessage(message) {
    let json = JSON.parse(message.data);
    let data = json.result;
    if(data&&data.length>0){
        data.forEach(rcuItem=>{
            let item = rcuItem.data;
            // let warnId = item.warnId.substring(0,item.warnId.lastIndexOf("_"));
            //判断事件是否被取消 如果告警事件被画上 并且接收到取消 则不进行接收
            if(removeWarning.indexOf(item.warnId)==-1){
                //如果是静态事件
                if(!item.isD){
                    //如果是静态事件，收到确认
                    let warning = {
                        "action":"cloud_event",
                        "body":{
                            "warnId":item.warnId,
                            "status":1
                        },
                        "type":2
                    };
                    let warningMsg = JSON.stringify(warning);
                    warningWebsocket.sendMsg(warningMsg);
                    // item.warnId = warnId;
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
                    // item.warnId = warnId;
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
            "polygon":perExtent
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
    cancelWarningWebsocket = new WebSocketObj(window.config.testUrl, _params, onCancelWarningMessage);
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
    let obj = {
        warnId:warnId,
        time:json.time
    }
    cancelWarningWebsocket.sendMsg(cancelWarningMsg);
    if(!processData.cancelWarning[warnId]){
        processData.cancelWarning[warnId]=obj;
    }
}
function processWarn(data){
    let warnId = data.warnId;
    if(warnId){
        //如果告警第一次画
        if(!warningData[warnId]){
            console.log("新增告警事件：",warnId,data.warnMsg);
            warningCount++;
            warningData[warnId] = {
                warnId: warnId,
                id:warnId,
                msg:data.warnMsg,
                longitude:data.longitude,
                latitude:data.latitude,
                eventType:data.eventType
            }
            gis3d.add3DInfoLabel(warnId,data.warnMsg,data.longitude,data.latitude,20, warningShow);

            let _warningData = {
                type: 'warningData',
                data: warningData
            }
            parent.postMessage(_warningData,"*");
        }else{
            //判断是否需要更新
            if(data.longitude != warningData[warnId].longitude || data.latitude != warningData[warnId].latitude) {
                gis3d.update3DInfoLabel(warnId,data.warnMsg);
            }
        }
    }
}
function processCancelWarn(data){
    data.forEach(warnId=>{
        if (warningCount > 0) {
            warningCount--;

            delete warningData[warnId];
            console.log("移除事件："+warnId);
            
            let _warningData = {
                type: 'warningData',
                data: warningData
            }
            parent.postMessage(_warningData,"*");

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