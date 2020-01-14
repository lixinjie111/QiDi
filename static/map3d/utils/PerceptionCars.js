
class PerceptionCars {
  constructor() {
    this.defualtZ = window.defualtZ;
    this.cacheModelNum = 200,//初始化车辆总数
    this.carColor = 0x80f77a,//感知车颜色
    this.pitch = 0,
    this.yaw = 0,
    this.roll = Math.PI * (10 / 90);
    this.deviceModels = { cars: {}, persons: [], texts: [] };
    this.viewer = null;
    this.devObj = {};
    this.pulseInterval = '';//阈值范围
    this.perMaxValue = '';
    this.cacheAndInterpolateDataByDevId = {};
    this.stepTime = '';
    this.count=0;
    this.perCars=[];
    this.removeObj = {};
    // this.drawnObj = {};
  }

  //接受数据
  addPerceptionData(data, miniLabel) {
    this.processPerceptionMesage(data, miniLabel);
  }

  addPerceptionOneFrame(fusionList) {

      try {

        this.clearAllModel();
             
        for (let i = 0; i < fusionList.length; i++) {
          let d = fusionList[i];
          if (d.heading < 0) {     
            continue;
          }
          if (d.type == 0) {//人
            this.addMoveModel(true, d, "person");
          }
          else if (d.type == 1) //自行车
          {
            this.addMoveModel(true, d, "bicycle");
          }
          else if (d.type == 2) { //感知车
            /////////////处理感知车数据
            this.addMoveModel(false, d, "carbox");
          }
          else if (d.type == 3) //摩托车
          {
            this.addMoveModel(false, d, "motorbike");
          }
          else if (d.type == 5) //公交车
          {
            this.addMoveModel(false, d, "bus");
          }
          else if (d.type == 7) //卡车
          {
            this.addMoveModel(false, d, "truck");
          }   
        }
      }
      catch (error) {
  
      }
  }

  receiveData(sideList) {
    sideList.forEach(item => {
      // if(item.devId=='RCU_2046A10433DB_3100000000132000002801'){
      if(!item.$ref){
        if (!this.devObj[item.devId]) {
            this.devObj[item.devId] = new Array();
        }
        this.devObj[item.devId].push(item);
      }
      // }
    });
  }
  cacheAndInterpolatePerCar(device) {
    let devId = device.devId;
    let cdata = this.cacheAndInterpolateDataByDevId[devId];
    let d = {
      devId: devId,
      devType: device.devType,
      targetType: device.targetType,
      type: device.type,
      gpsTime: device.gpsTime,
      rcuId: device.rcuId,
      batchId: device.gpsTime,
      data: device.data
    };
    if (cdata == null)//没有该车的数据
    {
      cdata = {
        cacheData: new Array(),
        lastRecieveData: null,
        nowRecieveData: null,
        isFirst: false
      };
      cdata.cacheData.push(d);
      cdata.lastRecieveData = d;
      cdata.nowRecieveData = d;
      this.cacheAndInterpolateDataByDevId[devId] = cdata;
    } else {//存在该路侧杆的数据
      cdata.nowRecieveData = d;
      if (cdata.nowRecieveData.gpsTime < cdata.lastRecieveData.gpsTime || cdata.nowRecieveData.gpsTime == cdata.lastRecieveData.gpsTime) {
        // console.log("到达顺序错误或重复数据");
        return;
      }
      let deltaTime = cdata.nowRecieveData.gpsTime - cdata.lastRecieveData.gpsTime;
      if (deltaTime <= this.stepTime) {
        // cdata.cacheData.push(cdata.nowRecieveData);
      } else {

        //插值处理
        let deltaLon = cdata.nowRecieveData.longitude - cdata.lastRecieveData.longitude;
        let deltaLat = cdata.nowRecieveData.latitude - cdata.lastRecieveData.latitude;
        // let steps = Math.floor(deltaTime / this.stepTime)-1;
        let steps = Math.floor(deltaTime / this.stepTime);
        // let steps = 27;
        // console.log(steps)
        // console.log(cdata.nowRecieveData.gpsTime, cdata.lastRecieveData.gpsTime,deltaTime,steps);
        // let steps = 1;
        let timeStep = deltaTime / steps;
        for (let i = 1; i <= steps; i++) {
          let d2 = {};
          d2.gpsTime = cdata.lastRecieveData.gpsTime + timeStep * i;
          d2.batchId = d.gpsTime;
          d2.data = device.data;
          cdata.cacheData.push(d2);
        }
      }
      //  this.$emit("pcarDataTime",cdata.nowRecieveData.gpsTime,cdata.lastRecieveData.gpsTime);
      cdata.lastRecieveData = cdata.nowRecieveData;
      /*if(vid=='B21E0004'){
          console.log(vid,data.time,"***************")
      }*/
    }
  }
  processPerTrack(time, delayTime,platCars) {
        // console.log("******");
        // let devList = [];
        let list = [];
        let obj = {
          "perList":[],
          "platFusionList":new Array(),
          "perFusionCars":new Array()
        }
        let drawObj = {};
        for (let devId in this.cacheAndInterpolateDataByDevId){
            let devCacheData = this.cacheAndInterpolateDataByDevId[devId];
            if (devCacheData && devCacheData.cacheData.length > 0){
              if(!this.removeObj[devId]){
                  this.removeObj[devId] = {
                    count:0,
                    list:[]
                  }
              }
                this.removeObj[devId].count=0;
                let devData = this.getMinValue(devId, time, delayTime, devCacheData.cacheData);
                if (!devData){
                    // console.log("没有找到相应的值")
                    return;
                }
                this.count=0;
                /*if (this.drawnObj[devId] != '' && devData.batchId == this.drawnObj[devId]) {
                  // console.log("重复绘制的点"+devId+"  ,"+DateFormat.formatTime(devData.batchId,'hh:mm:ss'))
                  return;
                }*/
                // this.drawnObj[devId] = devData.batchId;
                drawObj[devId] = devData;
                let fusionList = devData.data||[];
                list.push.apply(list,fusionList);
                this.removeObj[devId].list = fusionList;
            }else{
                //消失机制
                this.removeObj[devId].count++;
                //超过5s没有缓存数就让消失
                if (this.removeObj[devId].count > 125){
                    console.log(devId, "到达5s，消失了");
                    let lastList = this.removeObj[devId].list;
                    if(lastList.length>0){
                        lastList.forEach(item=>{
                            this.removeModelPrimitives(item.vehicleId);
                        })
                    }
                    delete this.removeObj[devId];
                    delete this.cacheAndInterpolateDataByDevId[devId];
                    delete this.devObj[devId];
                }
            }
        }
        //如果本次没找见 则清除所有的模型
        // if(!drawObj){
        //     this.count++;
        //     if(this.count>=10){
        //         this.clearAllModel();
        //     }
        // }
      //融合结果

      let typeList = [0,1,2,3,5,7];
      if(list&&list.length>0&&platCars&&platCars.length>0){
          //遍历平台车
          for(let i=0;i<platCars.length;i++){
              let platLng = platCars[i].longitude;
              let platLat = platCars[i].latitude;
              let platHeading = platCars[i].heading;
              //遍历感知车
              for(let j=0;j<list.length;j++){
                  // console.log(list[j].vehicleId,list[j].devId,list[j].longitude,list[j].latitude)
                  if(typeList.indexOf(list[j].targetType)!=-1){
                      let perLng = list[j].longitude;
                      let perLat = list[j].latitude;
                      let perHeading = list[j].heading;
                      let lngDiff = Math.abs(perLng-platLng).toFixed(6);
                      let latDiff = Math.abs(platLat-perLat).toFixed(6);
                      let headingDiff = Math.abs(perHeading-platHeading);
                      if(lngDiff<window.fusionLng&&latDiff<window.fusionLat&&headingDiff<window.fusionHeading){
                          obj.platFusionList.push(platCars[i]);
                          let per = list.splice(j,1);
                          // let per = list;
                          obj.perFusionCars.push(per[0]);//左侧统计计数
                          // console.log(list[j].vehicleId,platCars[i].plateNo,list[j].targetType);
                          // console.log(platCars[i].vehicleId,per[0].vehicleId);
                          break;
                      }
                  }
              }
          }
      }
      obj.perList=list;
      return obj;
  }
  getMinValue(devId, time, delayTime, cacheData) {
    /* let minDiff = Math.abs(time-minData.gpsTime-delayTime);*/
    let rangeData = null;
    let startIndex = -1;
    let minIndex = -1;
    let minData = null;
    let minDiff;
    // console.log("找到最小值前："+cacheData.length);
    //找到满足条件的范围
    for (let i = 0; i < cacheData.length; i++) {
      let diff = Math.abs(time - cacheData[i].gpsTime - delayTime);
      // console.log(devId,cacheData.length,time,parseInt(cacheData[i].gpsTime),delayTime,diff,i)
      if (diff < this.pulseInterval) {
        if (startIndex != -1 && i != startIndex + 1) {
          break;
        }
        if (!rangeData || (rangeData && diff < rangeData.delayTime)) {
          startIndex = i;
          let obj = {
            index: i,
            delayTime: diff,
            data: cacheData[i]
          }
          minDiff = diff;
          rangeData = obj;
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
      this.cacheAndInterpolateDataByDevId[devId].isFirst = true;
    } else {
      // console.log("plat***********************");
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
    // console.log("感知车最小索引:",devId,minIndex,minDiff,cacheData.length,DateFormat.formatTime(time,'hh:mm:ss:ms'),DateFormat.formatTime((minData.gpsTime+delayTime),'hh:mm:ss:ms'),DateFormat.formatTime(new Date().getTime(),'hh:mm:ss:ms'));
    // console.log("找到最小值",parseInt(minData.gpsTime),minData.batchId);
    //标尺还没对齐  return;
    if (minDiff && minDiff > this.perMaxValue && !this.cacheAndInterpolateDataByDevId[devId].isFirst) {
      return;
    }


    // console.log("最小索引:",devId,minIndex,minDiff,time,minData.data.length);
    // if(minData){
    //     minData.data.forEach(item=>{
    //         console.log(parseInt(minData.gpsTime),item.vehicleId,item.targetType);
    //     });
    // }


    //对其后，找不到符合范围的  最小值保留
    if (minDiff && minDiff > this.perMaxValue && this.cacheAndInterpolateDataByDevId[devId].isFirst) {
      // console.log(devId,"不在范围内")
      // console.log("per找到最小值无效",this.cacheAndInterpolateDataByDevId[devId].isFirst);
    } else {
      this.cacheAndInterpolateDataByDevId[devId].cacheData = this.cacheAndInterpolateDataByDevId[devId].cacheData.filter((item, index) => {
        return index > minIndex;
      });
    }
    //打印出被舍弃的点
    // let lostData = this.cacheAndInterpolateDataByDevId[devId].cacheData.filter((item, index) => {
    //   return index < minIndex;
    // })
    //   if(lostData.length>0){
    //       console.log("丢失数据长度",lostData.length);
    //       lostData.forEach(item => {
    //           let d = Math.abs(time - parseInt(item.gpsTime) - delayTime);
    //           console.log("丢失的数据：",parseInt(item.gpsTime),d,minDiff,item.batchId);
    //           console.log("此帧车辆数据的长度："+item.data.length);
    //           item.data.forEach(data=>{
    //               console.log("车辆数据：",data);
    //           });
    //       })
    //   }
    //找到最小值后，将数据之前的数值清除
    // console.log("找到最小值后"+this.cacheAndInterpolateDataByDevId[devId].cacheData.length);
    //返回距离标尺的最小插值的数据
    return minData;
  }
  //************************************* */ 地图部分******************************
  //绘制感知车
  processPerceptionMesage(fusionList, miniLabel=false,isShow=true) {
    let _this = this;
    try {
      // _this.processPerceptionDataIntervalId = setInterval(() => {
      if (_this.deviceModels == undefined) return;
      // console.log("开始绘制");
      if(isShow)
      {
        this.clearModel(fusionList);
        if (fusionList.length <= 0) return;
        for (let i = 0; i < fusionList.length; i++) {
          let d = fusionList[i];

          // if (d.heading >=360) {
          //     // 不处理大于360的的数据
          //     continue;
          // }
          if (d.heading < 0) {
            // 不处理小于0的的数据
            continue;
          }
          if (d.targetType == 0) {//人
            this.addMoveModel(true, d, "person");
            this.addMoveLable(d, "personlabel", 3,miniLabel);
          }
          else if (d.targetType == 1) //自行车
          {
            this.addMoveModel(true, d, "bicycle");
            this.addMoveLable(d, "bicyclelabel", 3,miniLabel);
          }
          else if (d.targetType == 2) { //感知车
            // console.log(d.vehicleId)
            /////////////处理感知车数据
            this.addMoveModel(false, d, "carbox");
            ///////////////////////////end
            //移动标签
            this.addMoveLable(d, "carboxlabel", 3,miniLabel);
          }
          else if (d.targetType == 3) //摩托车
          {
            this.addMoveModel(false, d, "motorbike");
            this.addMoveLable(d, "motorbikelabel", 3,miniLabel);
          }
          else if (d.targetType == 5) //公交车
          {
            this.addMoveModel(false, d, "bus");
            //移动标签
            this.addMoveLable(d, "buslabel", 5,miniLabel);
          }
          else if (d.targetType == 7) //卡车
          {
            this.addMoveModel(false, d, "truck");
            //移动标签
            this.addMoveLable(d, "trucklabel", 5,miniLabel);
          }
        }
      }
      else
      {
        this.clearModel(fusionList);
      }
    }
    catch (error) {

    }
    // },0); //
  }
  //增加和移动标签
  addMoveLable(d, name, h,miniTable) {
    var carlabel = this.viewer.entities.getById(d.vehicleId + name);
    if (carlabel == null || carlabel == undefined) {
      this.addModeCarLabel(d, 5, name,miniTable);
    }
    else {
      this.moveModelLabel(carlabel, d, h);
    }
  }
  //增加移动模型
  addMoveModel(isAnimation, d, name) {
    let vehicleId = d.vehicleId || d.uuid;
    let carModel = this.getModelForPrimitive(vehicleId + name);//this.deviceModels.cars[d.vehicleId+"car"];
    if (carModel == null) {
      // console.log("新增："+d.vehicleId + name)
      //初始化增加车辆 如果没有隐藏车辆的模型
      this.addModeCar(isAnimation, d, name, name);
    }
    else {
      // console.log("移动："+d.vehicleId + name)
      this.moveModel(carModel, d, name);
    }
  }
  clearAllModel() {
    this.removeAllModelPrimitives();
    this.removeAllModelEntities();
  }
  removeAllModelPrimitives() {
    var primitives = this.viewer.scene.primitives;
    for (var i = 0; i < primitives.length; i++) {
      var primitive = primitives.get(i);
      if (primitive.id) {
        if (primitive.id.search("carbox") != -1 || primitive.id.search("person") != -1 || primitive.id.search("bicycle") != -1 ||
          primitive.id.search("motorbike") != -1 || primitive.id.search("bus") != -1 || primitive.id.search("truck") != -1) {
          this.viewer.scene.primitives.remove(primitive);
          i--;
        }
      }
    }
  }
  removeAllModelEntities() {
    var entities = this.viewer.entities._entities._array;
    for (var i = 0; i < entities.length; i++) {
      if (entities[i].id) {
        if (entities[i].id.search("label") != -1) {
          this.viewer.entities.remove(entities[i]);
          i--;
        }
      }
    }
  }
  clearModel(fusionList) {
    this.clearCar(fusionList, "carbox");
    this.clearCar(fusionList, "person");
    this.clearCar(fusionList, "bicycle");
    this.clearCar(fusionList, "motorbike");
    this.clearCar(fusionList, "bus");
    this.clearCar(fusionList, "truck");

    // this.clearCarLabel( "labelcarbox");
    // this.clearCarLabel( "labelperson");
    // this.clearCarLabel(fusionList,"labelperson");
    // this.clearCarLabel(fusionList);
  }
  clearCarLabel(fusionList) {
    /////////////////////////
    let countLable = 0;
    var entities = this.viewer.entities._entities._array;
    for (var i = 0; i < entities.length; i++) {
      var entitie = entities[i];
      let isTrue = false;
      for (var kk = 0; kk < fusionList.length; kk++) {
        if (entitie.id == fusionList[kk].vehicleId + "labelcarbox") {
          isTrue = true;
          break;
        }
        else {
          isTrue = false;
        }
      }
      if (!isTrue) {
        if (entitie.id) {
          if (entitie.id.search("label") != -1) {
            entitie.show = false;
          }
          countLable++;
        }

      }
    }
    if ((countLable - fusionList.length) >= 30) {
      this.removeModelEntities();
    }
    // console.log(fusionList.length + "空闲文字" + countLable)
  }
  clearCar(fusionList, name) {
    let _this = this;
    //复位感知车
    let count = 0;
    var primitives = _this.viewer.scene.primitives;
    for (var i = 0; i < primitives.length; i++) {
      var primitive = primitives.get(i);
      let isTrue = false;
      // console.log("---------")
      //   console.log(typeof fusionList);
      for (var kk = 0; kk < fusionList.length; kk++) {
        if (primitive instanceof Cesium.Model && (primitive.id == fusionList[kk].vehicleId + name)) {
          isTrue = true;
          break
        }
        else {
          isTrue = false;
        }
      }
      if (!isTrue) {
        if (primitive.id) {
          if (primitive.id.indexOf(name) != -1) {
            primitive.show = false;
            // console.log("隐藏",primitive.id)
            var carlabel = this.viewer.entities.getById(primitive.id + "label");
            if (carlabel != null || carlabel != undefined) {
              carlabel.show = false;
            }
          }
          count++;
        }

      }
    }
    if ((count - fusionList.length) >= window.count) {
      this.removeModelPrimitives(name);
      this.removeModelEntities(name);
    }
    // console.log(fusionList.length + "空闲车" + count)
  }
  /**
   * 增加车辆
   * @param {数据} 
   */
  addModeCar(isAnimation, d, name, glbName) {
    var position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, this.defualtZ);
    var heading = Cesium.Math.toRadians(d.heading);
    var pitch = 0;
    var roll = 0;
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    let fixedFrameTransforms = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')
    var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransforms)

    let vehicleId = d.vehicleId || d.uuid;
    let model = this.viewer.scene.primitives.add(Cesium.Model.fromGltf({
      id: vehicleId + name,
      modelMatrix: modelMatrix,
      url: '../../static/map3d/model/' + glbName + '.glb',
      minimumPixelSize: 1,
      show: true,
      maximumScale: 5,
      // color : Cesium.Color.fromAlpha(Cesium.Color.CHARTREUSE  , parseFloat(1)),
      // silhouetteColor : Cesium.Color.fromAlpha(Cesium.Color.RED, parseFloat(1)),//轮廓线
      colorBlendMode: Cesium.ColorBlendMode.Mix
      //   ,
      //   scale : 3.0     //放大倍数
      // debugWireframe:true
    }));
    if (isAnimation) {
      //添加动画
      Cesium.when(model.readyPromise).then(function (model) {
        model.activeAnimations.addAll({
          loop: Cesium.ModelAnimationLoop.REPEAT,//控制重复
          speedup: 0.5, // 速度，相对于clock
          reverse: false // 动画反转
        })
      });
    }
    // console.log("绘制车辆",d.vehicleId + name);

  }
  removeModelPrimitives(name) {
    var primitives = this.viewer.scene.primitives;
    let index=0; //保留其中一个模型
    for (var i = 0; i < primitives.length; i++) {
      var primitive = primitives.get(i);
      if (primitive.id) {
        if (primitive instanceof Cesium.Model && !primitive.show && primitive.id.search(name) != -1) {
          if(index==0)
          {
            index++
          }
          else
          {
            this.viewer.scene.primitives.remove(primitive);
            i--;
          } 
       
        }
      }
    }
  }
  removeModelEntities(name) {
    var entities = this.viewer.entities._entities._array;
    for (var i = 0; i < entities.length; i++) {
      if (entities[i].id) {
        if (!entities[i].show && entities[i].id.search(name) != -1) {
          this.viewer.entities.remove(entities[i]);
          i--;
        }
      }
    }
  }
  //获取没有显示的模型
  getShowModelPrimitive(name) {
    var primitives = this.viewer.scene.primitives;
    for (var i = 0; i < primitives.length; i++) {
      var primitive = primitives.get(i);
      if (primitive instanceof Cesium.Model && !primitive.show && primitive.id.search(name) != -1) {
        return primitive;
      }
    }
  }
  getModelForPrimitive(id) {
    var primitives = this.viewer.scene.primitives;
    for (var i = 0; i < primitives.length; i++) {
      var primitive = primitives.get(i);
      if (primitive instanceof Cesium.Model && primitive.id === id) {
        return primitive;
      }
    }
  }
  //移动模型
  moveModel(carmodel, d, name) {
    var position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, this.defualtZ);
    var heading = Cesium.Math.toRadians(d.heading);
    var pitch = 0;
    var roll = 0;
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
    //carmodel.orientation = orientation;
    carmodel.modelMatrix = orientation;
    carmodel.show = true;
    carmodel.id = d.vehicleId + name;
    //判断如果等或者大于360度，设置红色
    //判断如果等或者大于360度，设置红色
    if (d.heading >= 360) {
      carmodel.color = Cesium.Color.fromAlpha(Cesium.Color.RED, parseFloat(1));
    }
    else {
      //清除第一次 出现360数据，第二次颜色问题
      if (carmodel.color.green == 0) {
        carmodel.color = new Cesium.Color(1, 1, 1, 1);
      }
    }
    let fixedFrameTransforms = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')
    Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransforms, carmodel.modelMatrix)

  }
  //增加文字标签
  addModeCarLabel(d, height, name,miniTable) {
    var position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, this.defualtZ + height);
    ///////////////增加文字
    let h = d.heading.toFixed(1);
    let s = d.speed.toFixed(1);
    let veh = d.vehicleId.substr(0, 4);
    // let text = "[" + h + ", " + s + ", " + veh + "]";
    let text = "[" + veh + ", " + h + "°]";

    let scaleLabel;
    if(miniTable){
      scaleLabel =  new Cesium.NearFarScalar(50, 1, 120, 0);
    }else{
      scaleLabel =  new Cesium.NearFarScalar(200, 1, 2000, 0)
    }

    let entityLabel = this.viewer.entities.add({
      id: d.vehicleId + name,
      position: position,
      point: {
        color: Cesium.Color.RED,    //点位颜色
        pixelSize: 0,         //像素点大小
        scaleByDistance: new Cesium.NearFarScalar(200, 0, 2000, 1)
      },
      label: {
        text: text,
        fillColor: Cesium.Color.fromCssColorString('#2f2f2f'),
        backgroundColor: Cesium.Color.fromCssColorString('#F5F5DC').withAlpha(0.5),
        font: '12px',
        showBackground: true,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        pixelOffset: new Cesium.Cartesian2(0.0, 0),
        // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.5),
        scaleByDistance: scaleLabel
      }
    });
  }
  /**
   * 移动文字标签
   */
  moveModelLabel(carlabel, d, height) {
    //var carlabel = this.viewer.entities.getById( d.vehicleId + "label");
    carlabel.position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, this.defualtZ + height);
    let h = d.heading.toFixed(1);
    let s = d.speed.toFixed(1);
    let veh = d.vehicleId.substr(0, 4);
    // let td = d.td;
    // let text;
    // if(td){
    //     text = "[" + veh + ", " + h + "°,"+td+"]";
    // }else{
    //     text = "[" + veh + ", " + h + "°]";
    // }
    let text = "[" + veh + ", " + h + "°]";
    carlabel.show = true;
    carlabel.label.text = text;
  }
  getShowModelLabelEntitie() {
    var entities = this.viewer.entities._entities._array;
    for (var i = 0; i < entities.length; i++) {
      if (!entities[i].show && entities[i].id.search("label") != -1) {
        return this.viewer.entities.getById(entities[i].id);
      }
    }
  }
}