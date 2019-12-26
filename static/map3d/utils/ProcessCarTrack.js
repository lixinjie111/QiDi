
/**
 * 平台车类
 */
class ProcessCarTrack {
    constructor() {
        this.viewer = null;//三维视图
        this.stepTime = '';//处理车缓存时间
        this.pulseInterval = '';//阈值范围
        this.platMaxValue = '';//平台车插值最大值
        this.receiveCount = 0;
        this.defualtZ = 0.8;
        this.roll = Math.PI * (10 / 90);
        this.pmodels = {};
        this.testCar = {};
        this.models = {};
        this.cacheTrackCarData = [];
        //按照vid缓存插值的小车轨迹
        this.cacheAndInterpolateDataByVid = {};
        this.mainCarVID = "";
        this.processPlatformCarsTrackIntervalId = null;
        this.platObj = {};
        this.singleObj = {};
        this.billboards = {};//存储发射信号
        this.sideList = [];//存储发射信号
        this.ispoleToCar = true;//是否连接感知杆
    }

    //路口视角  平台车
    onCarMessage(data, flag) {
        // console.log('----------')
        // console.log(data.time);
        // this.cacheTrackCarData=data;
        this.thisMessage(flag, data);
    }
    //接受数据
    thisMessage(isCar, data) {
        let data2 = data.result.data;
        if (isCar == 0) {
            for (let n = 0; n < data2.length; n++) {
                let pcar = data2[n];
                if (pcar.heading < 0) {
                    // 不处理小于0的的数据
                    continue;
                }
                // if (pcar.vehicleId == "B21E0003")
                //缓存数据
                this.cacheAndInterpolatePlatformCar(pcar, data);
            }
        }
        else {
            for (let n = 0; n < data2.length; n++) {
                let pcar = data2[n];
                if (pcar.heading < 0) {
                    // 不处理小于0的的数据
                    continue;
                }
                //缓存数据
                this.cacheAndInterpolatePlatformCar(pcar, null);
            }
            let datamain = data.result.selfVehInfo;
            if (datamain != null) {
                this.mainCarVID = datamain.vehicleId;
                this.cacheAndInterpolatePlatformCar(datamain, null);
            }
        }
    }

    //接收数据
    receiveData(json, time, mainCarId) {
        let data = json.result.data;
        for (let vehicleId in data) {
            // if(vehicleId=='B21E0002'){
            //     let diff = json.time - data[vehicleId][0].gpsTime;
            //     let diff1 = time - json.time;
            let diff = new Date().getTime() - data[vehicleId][0].gpsTime;
            let diff1 = json.time - data[vehicleId][0].gpsTime;
            let diff2 = new Date().getTime() - json.time
            // console.log("vehicleId:"+vehicleId+",send:"+DateFormat.formatTime(json.time,'hh:mm:ss')+",gpsTime:"+DateFormat.formatTime(data[vehicleId][0].gpsTime,'hh:mm:ss')+",pulseTime"+DateFormat.formatTime(time,'hh:mm:ss')+",local："+DateFormat.formatTime(new Date().getTime(),'hh:mm:ss')+",'local-send'"+diff2+",'local-gps:'"+diff+",'send-gps:'"+diff1)
            let vehList = data[vehicleId];
            let cdata = this.platObj[vehicleId];
            if (cdata == null) {
                cdata = new Array();
            }
            //单车视角
            if (mainCarId && vehicleId == mainCarId) {
                this.mainCarVID = mainCarId;
                for (let i = 0; i < vehList.length; i++) {
                    let flag = false;
                    if (cdata.length > 0) {
                        for (let j = 0; j < cdata.length; j++) {
                            //判断主车位置是否更新
                            if (vehList[i].gpsTime == cdata[j].gpsTime) {
                                flag = true;
                                break;
                            }
                        }
                        if (flag) {
                            continue;
                        } else {
                            cdata.push(vehList[i]);
                        }
                    } else {
                        Array.prototype.push.apply(cdata, vehList);
                    }
                }
            } else {
                Array.prototype.push.apply(cdata, vehList);
            }
            this.platObj[vehicleId] = cdata;
            // }
        }
        // console.log(vehicleId,this.platObj[vehicleId].length);
    }
    //缓存并且插值平台车轨迹
    cacheAndInterpolatePlatformCar(car) {
        let vid = car.vehicleId;
        let cdata = this.cacheAndInterpolateDataByVid[vid];
        let d = {
            vehicleId: vid,
            plateNo: car.plateNo,
            longitude: car.longitude,
            latitude: car.latitude,
            gpsTime: car.gpsTime,
            heading: car.heading,
            devType: car.devType,
            type: car.type,
            curSource: car.curSource
        };
        if (cdata == null)//没有该车的数据
        {
            cdata = {
                cacheData: new Array(),
                intervalid: null,
                lastReceiveData: null,
                nowReceiveData: null,
                // lastProcessData: null,
                // nowProcessData: null,
                plateNo: null
            };

            cdata.cacheData.push(d);
            cdata.lastReceiveData = d;
            cdata.nowReceiveData = d;
            this.cacheAndInterpolateDataByVid[vid] = cdata;
        } else {//存在该车的数据


            cdata.nowReceiveData = d;
            // console.log("积压长度")
            //     console.log(cdata.cacheData.length,d.vehicleId)
            // var position = Cesium.Cartesian3.fromDegrees(car.longitude, car.latitude, 0.0);
            //
            // var heading = Cesium.Math.toRadians(car.heading);
            // var pitch = 0;
            // var roll = 0;
            // var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
            // var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
            // this.testCar.modelMatrix = orientation;
            //
            // let fixedFrameTransforms = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')
            // Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransforms, this.testCar.modelMatrix)


            if (cdata.nowReceiveData.gpsTime < cdata.lastReceiveData.gpsTime || cdata.nowReceiveData.gpsTime == cdata.lastReceiveData.gpsTime) {
                // console.log("到达顺序错误或重复数据");
                return;
            }
            let deltaTime = cdata.nowReceiveData.gpsTime - cdata.lastReceiveData.gpsTime;
            if (deltaTime <= this.stepTime) {
                // cdata.cacheData.push(cdata.nowReceiveData);
            } else {
                //插值处理
                let deltaLon = cdata.nowReceiveData.longitude - cdata.lastReceiveData.longitude;
                let deltaLat = cdata.nowReceiveData.latitude - cdata.lastReceiveData.latitude;
                let delheading = cdata.nowReceiveData.heading - cdata.lastReceiveData.heading;
                // let steps = Math.floor(deltaTime / this.stepTime)-1;
                let steps = Math.ceil(deltaTime / this.stepTime);
                // let steps = 27;
                // console.log(steps)
                // console.log(cdata.nowReceiveData.gpsTime, cdata.lastReceiveData.gpsTime,deltaTime,steps);
                // let steps = 1;
                let timeStep = deltaTime / steps;
                let lonStep = deltaLon / steps;
                let latStep = deltaLat / steps;
                let headStep;
                if (delheading > 270) {
                    headStep = 0;
                } else {
                    headStep = delheading / steps;
                }
                for (let i = 1; i <= steps; i++) {
                    let d2 = {};
                    d2.longitude = cdata.lastReceiveData.longitude + lonStep * i;
                    d2.latitude = cdata.lastReceiveData.latitude + latStep * i;
                    d2.gpsTime = cdata.lastReceiveData.gpsTime + timeStep * i;
                    d2.heading = cdata.lastReceiveData.heading + headStep * i;
                    d2.vehicleId = cdata.nowReceiveData.vehicleId;
                    d2.plateNo = cdata.nowReceiveData.plateNo;
                    d2.devType = cdata.nowReceiveData.devType;
                    d2.curSource = cdata.nowReceiveData.curSource;
                    d2.steps = i;
                    cdata.cacheData.push(d2);
                }
            }
            cdata.lastReceiveData = cdata.nowReceiveData;
        }
    }
    processPlatformCarsTrack(time, delayTime) {

        // console.log("-------")
        let _this = this;
        let platVeh = 0;
        let v2xVeh = 0;
        let vehData = {};

        let platCar = {
            'mainCar': {},
            'vehData': new Object()
        };
        try {
            for (var vid in _this.cacheAndInterpolateDataByVid) {
                let carCacheData = _this.cacheAndInterpolateDataByVid[vid];
                // console.log(carCacheData.nowReceiveData.gpsTime)
                if (carCacheData != null) {
                    if (carCacheData.cacheData.length > 0) {
                        //缓存数据
                        let cacheData = _this.cacheAndInterpolateDataByVid[vid].cacheData;
                        // console.log(cacheData.length);
                        let cardata = _this.getMinValue(vid, time, delayTime);
                        // let cardata = cacheData.shift();+
                        if (!cardata) {
                            return;
                        }
                        // console.log(cardata)
                        if (cardata.devType == 1) {
                            platVeh++;
                        }
                        if (cardata.devType == 2) {
                            v2xVeh++;
                        }
                        _this.moveCar(cardata); 
                        if (_this.mainCarVID == cardata.vehicleId) {
                            // mainCar= cardata;
                            platCar['mainCar'] = cardata
                            _this.moveTo(cardata);
                            //主车
                        }
                        else
                        {
                            _this.poleToCar(cardata);
                        }
                    }
                }
            }
            vehData.platVeh = platVeh;
            vehData.v2xVeh = v2xVeh;
            platCar['vehData'] = vehData;
        } catch (error) {
            return null;
        }
        return platCar;
    }
    //检测感知杆和单车关联
    poleToCar(d) {
        let vid = d.vehicleId;
        var item = this.sideList;
        var itemSide = this.sideList;
        if (typeof itemSide == 'string') {
            itemSide = JSON.parse(item);
        }
        // console.log(item)
        if (itemSide != null && itemSide.length > 0) {

            for (var i = 0; i < itemSide.length; i++) {
                let x = itemSide[i].longitude;
                let y = itemSide[i].latitude;
                if (itemSide[i].roadSideRsu == 1) {
                    let _line = function line(result) {
                        return Cesium.Cartesian3.fromDegreesArrayHeights([d.longitude, d.latitude, 1, x, y, 6.3], Cesium.Ellipsoid.WGS84, result);
                    }

                    if (Math.abs(GisUtils.getDistance(itemSide[i].latitude, itemSide[i].longitude, d.latitude, d.longitude)) > 0.5)
                    //    if(Math.abs(121.172434- d.longitude)>0.001&&Math.abs(31.284172- d.latitude)>0.001)
                    {
                        if (this.viewer.entities.getById(vid + "line" + itemSide[i].deviceId) != null) {
                            this.viewer.entities.remove(this.viewer.entities.getById(vid + "line" + itemSide[i].deviceId));
                        } 
                    }
                    else {
                        if (this.viewer.entities.getById(vid + "line" + itemSide[i].deviceId) == null) {
                            //连接线
                            var redLine = this.viewer.entities.add({
                                id: vid + "line" + itemSide[i].deviceId,
                                polyline: {
                                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2000),
                                    // This callback updates positions each frame.
                                    positions: new Cesium.CallbackProperty(_line, false),// Cesium.Cartesian3.fromDegreesArrayHeights([ d.longitude, d.latitude,0.1, 121.17070961131611, 31.285431834985424,1]),//
                                    width: 5,
                                    material: new Cesium.PolylineGlowMaterialProperty({
                                        color: Cesium.Color.DEEPSKYBLUE,
                                        glowPower: 0.25
                                    })
                                }
                            });
                        }
                        else {
                            this.viewer.entities.getById(vid + "line" + itemSide[i].deviceId).show = true;
                            this.viewer.entities.getById(vid + "line" + itemSide[i].deviceId).polyline.positions = new Cesium.CallbackProperty(_line, false)
                        }
                    }
                }
            }
        }
    }
    getMinValue(vid, time, delayTime) {
        let cacheData = this.cacheAndInterpolateDataByVid[vid].cacheData;
        let rangeData = null;
        let startIndex = -1;
        let minIndex = -1;
        let minData = {};
        let minDiff;
        // console.log("找到最小值前："+cacheData.length);
        //找到满足条件的范围
        for (let i = 0; i < cacheData.length; i++) {
            let diff = Math.abs(time - cacheData[i].gpsTime - delayTime);
            // console.log(vid,cacheData.length,time,parseInt(cacheData[i].gpsTime),delayTime,diff,i)
            if (diff < this.pulseInterval) {
                if (startIndex != -1 && i != startIndex + 1) {
                    break;
                }
                if (!rangeData || (rangeData && diff < rangeData.delayTime)) {
                    startIndex = i;
                    let obj = {
                        index: i,
                        delayTime: diff,
                        data: cacheData[i],
                        diff: diff
                    }
                    rangeData = obj;
                    minDiff = diff;
                } else {
                    break;
                }
            } else {
                if (rangeData) {
                    break;
                }
            }
        }
        //如果能找到最小范围
        // console.log(rangeData)
        if (rangeData) {
            minIndex = rangeData.index;
            minData = rangeData.data;
        } else {
            // console.log("plat没有符合范围的");
            minIndex = 0;
            minData = cacheData[0];
            minDiff = Math.abs(time - minData.gpsTime - delayTime);
            for (let i = 0; i < cacheData.length; i++) {
                let diff = Math.abs(time - parseInt(cacheData[i].gpsTime) - delayTime);
                // let diff = time-cacheData[i].gpsTime-insertTime;
                // console.log(vid,cacheData.length, time, parseInt(cacheData[i].gpsTime) , diff)
                if (diff < minDiff) {
                    minData = cacheData[i];
                    minIndex = i;
                    minDiff = diff;
                }

            }
        }
        // console.log("平台车最小索引:",vid,minIndex)
        // console.log("平台车最小索引:",vid,minIndex,cacheData.length,minDiff,DateFormat.formatTime(time,'hh:mm:ss:ms'),DateFormat.formatTime((minData.gpsTime+delayTime),'hh:mm:ss:ms'),DateFormat.formatTime(new Date().getTime(),'hh:mm:ss:ms'));
        if (minDiff && minDiff > this.platMaxValue) {
            // console.log("plat找到最小值无效")
            return;
        }
        //打印出被舍弃的点
        let lostData = this.cacheAndInterpolateDataByVid[vid].cacheData.filter((item, index) => {
            return index < minIndex;
        })
        /*if(lostData.length>0){
            
        }*/
        lostData.forEach(item => {
            let minDiff = Math.abs(time - cacheData[minIndex].gpsTime);
            // console.log("插值最小的索引"+minIndex,minDiff);
            let d = Math.abs(time - item.gpsTime);
            // console.log("##"+d);
        })


        //找到最小值后，将数据之前的数值清除
        this.cacheAndInterpolateDataByVid[vid].cacheData = this.cacheAndInterpolateDataByVid[vid].cacheData.filter((item, index) => {
            return index > minIndex;
        })
        // console.log("找到最小值后"+this.cacheAndInterpolateDataByVid[vid].cacheData.length);

        //返回距离标尺的最小插值的数据
        return minData;
    }
    destroyed() {
        clearInterval(this.processPlatformCarsTrackIntervalId);
    }
    moveCar(d) {
        let vid = d.vehicleId;
        let plateNo = d.plateNo;
        let carModel = this.models[vid];
        if (carModel == null) {

            var position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, 0.0);
            var heading = Cesium.Math.toRadians(0);
            var pitch = Cesium.Math.toRadians(0);
            var roll = 0;
            var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
            var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
            //e.cesium.viewer.entities.add(entity);



            let url = '../../static/map3d/model/car.glb';
            if (this.mainCarVID == vid) {
                url = '../../static/map3d/model/carMian.glb';
            }

            if (d.devType == 1)//obu车
            {
                if (d.plateNo == "未注册") {
                    url = '../../static/map3d/model/car_near_Black.glb';
                }
                //增加光环
                this.addEllipse(vid, position);
            }

            this.viewer.scene.primitives.add(Cesium.Model.fromGltf({
                id: vid + "car",
                modelMatrix: modelMatrix,
                url: url,
                minimumPixelSize: 1,
                show: true,
                maximumScale: 100,
            }));
            this.models[vid] = vid;


            ////////////////////////
            let entityLabel = this.viewer.entities.add({
                id: vid + "lblpt",
                position: position,
                point: {
                    color: Cesium.Color.RED,    //点位颜色
                    pixelSize: 0              //像素点大小
                },
                label: {
                    fillColor: Cesium.Color.fromCssColorString('#2f2f2f'),
                    backgroundColor: Cesium.Color.fromCssColorString('#F5F5DC').withAlpha(0.5),
                    text: d.plateNo,
                    font: '14px',
                    showBackground: true,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    pixelOffset: new Cesium.Cartesian2(0.0, 0),
                    scaleByDistance: new Cesium.NearFarScalar(100, 1, 2000, 0)
                }
            });
            let urlImg = '../../static/map3d/images/4g.png';
            if (d.curSource == "4G") {
                urlImg = '../../static/map3d/images/4g.png';
            }
            else if (d.curSource == "V2X") {
                urlImg = '../../static/map3d/images/v2x.png';
            }
            else {
                urlImg = '../../static/map3d/images/4gv2x.png';
            }
            var entity = this.viewer.entities.add({
                id: vid + "billboard",
                position: Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude,3),
                billboard: {
                    image: urlImg,
                    scaleByDistance: new Cesium.NearFarScalar(70, 1, 150, 0.5)
                }
            });


        } else {

            let carpt = null;
            var primitives = this.viewer.scene.primitives;
            var length = primitives.length;
            for (var k = 0; k < length; ++k) {
                var p = primitives.get(k);

                if (p.id == vid + "car") {
                    carpt = p;

                    break;
                }
            }
            if (carpt == null) return;
            var position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, 0.0);

            // console.log(d.longitude);
            var heading = Cesium.Math.toRadians(d.heading);
            var pitch = 0;
            var roll = 0;
            var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
            var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
            carpt.modelMatrix = orientation;

            let fixedFrameTransforms = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')
            Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransforms, carpt.modelMatrix)

            var carlabelpt = this.viewer.entities.getById(vid + "lblpt");
            carlabelpt.position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, 4);
            carlabelpt.label.text = plateNo;
            //增加信号指示
            let billboard = this.viewer.entities.getById(vid + "billboard");
            if (billboard != null) {
                billboard.position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, 2);
            }

            if (d.devType == 1)//obu车
            {
                //修改光环大小
                this.viewer.entities.getById(vid + "ellipse1").position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, this.defualtZ + 4);
                this.viewer.entities.getById(vid + "ellipse2").position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, this.defualtZ + 4);
                this.viewer.entities.getById(vid + "ellipse3").position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, this.defualtZ + 4);
                this.viewer.entities.getById(vid + "ellipse4").position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, this.defualtZ + 4);
            }

        }
    }
    //添加光环
    addEllipse(vid, position) {
        //光环
        var r1 = 0, r2 = 2.5, r3 = 5, r4 = 7.5;
        function changeR1() { //这是callback，参数不能内传
            r1 = r1 + 0.1;
            if (r1 >= 10) {
                r1 = 0;
            }
            return r1;
        }
        //光环回调
        function changeR2() {
            r2 = r2 + 0.1;
            if (r2 >= 10) {
                r2 = 0;
            }
            return r2;
        }
        function changeR3() {
            r3 = r3 + 0.1;
            if (r3 >= 10) {
                r3 = 0;
            }
            return r3;
        }
        function changeR4() {
            r4 = r4 + 0.1;
            if (r4 >= 10) {
                r4 = 0;
            }
            return r4;
        }
        //光环
        this.viewer.entities.add({
            id: vid + "ellipse1",
            position: position,
            ellipse: {
                semiMinorAxis: new Cesium.CallbackProperty(function () {
                    return r1
                }, false),
                semiMajorAxis: new Cesium.CallbackProperty(changeR1, false),
                height: this.defualtZ + 0.3,
                outline: true, //必须设置height，否则ouline无法显示
                outlineColor: Cesium.Color.fromCssColorString('#f4f422').withAlpha(1),
                outlineWidth: 2.0,//不能设置，固定为1
                fill: false
            }
        });

        this.viewer.entities.add({
            id: vid + "ellipse2",
            position: position,
            ellipse: {
                semiMinorAxis: new Cesium.CallbackProperty(function () {
                    return r2
                }, false),
                semiMajorAxis: new Cesium.CallbackProperty(changeR2, false),
                height: this.defualtZ + 0.3,
                outline: true, //必须设置height，否则ouline无法显示
                outlineColor: Cesium.Color.fromCssColorString('#f4f422').withAlpha(1),
                outlineWidth: 2.0,//不能设置，固定为1
                fill: false
            }
        });

        this.viewer.entities.add({
            id: vid + "ellipse3",
            position: position,
            ellipse: {
                semiMinorAxis: new Cesium.CallbackProperty(function () {
                    return r3
                }, false),
                semiMajorAxis: new Cesium.CallbackProperty(changeR3, false),
                height: this.defualtZ + 0.3,
                outline: true, //必须设置height，否则ouline无法显示
                outlineColor: Cesium.Color.fromCssColorString('#f4f422').withAlpha(1),
                outlineWidth: 2.0,//不能设置，固定为1
                fill: false
            }
        });
        this.viewer.entities.add({
            id: vid + "ellipse4",
            position: position,
            ellipse: {
                semiMinorAxis: new Cesium.CallbackProperty(function () {
                    return r4
                }, false),
                semiMajorAxis: new Cesium.CallbackProperty(changeR4, false),
                height: this.defualtZ + 0.3,
                outline: true, //必须设置height，否则ouline无法显示
                outlineColor: Cesium.Color.fromCssColorString('#f4f422').withAlpha(1),
                outlineWidth: 2.0,//不能设置，固定为1
                fill: false
            }
        });
    }
    //主车移动
    moveTo(d) {
        var heading = Cesium.Math.toRadians(d.heading);
        var pitch = -0.1569132859032279;// -0.2469132859032279;
        var roll = 0.0029627735803421373;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);

        this.viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, 2.5),
            orientation: hpr
        });
    }

}