class PerceptionCars {
  constructor() {
    this.defualtZ = window.defualtZ;
    this.cacheModelNum = 200,//初始化车辆总数
      this.carColor = 0x80f77a,//感知车颜色
      this.pitch = 0,
      this.yaw = 0,
      this.roll = Math.PI * (10 / 90);
    this.deviceModels = { cars: {}, persons: [], texts: [] };
    this.cachePerceptionQueue = new Array(); //缓存感知数据
    this.lastPerceptionMessage = null;
    this.viewer = null;
    this.processPerceptionDataIntervalId = null;
    this.devObj = {};
    this.pulseInterval = '';//阈值范围
    this.cacheAndInterpolateDataByDevId = {};
    this.stepTime = '';
    this.drawObj = {};
    this.historyObj = [];
  }
  //接受数据
  addPerceptionData(data, miniLabel) {
    this.processPerceptionMesage(data, miniLabel);
  }
  receiveData(sideList) {
    sideList.forEach(item => {
      if (!this.devObj[item.devId]) {
        this.devObj[item.devId] = new Array();
      }
      item.gpsTimeFormat = TDate.formatTime(item.gpsTime, "yy-mm-dd hh:mm:ss:ms");
      item.updateTimeFormat = TDate.formatTime(item.updateTime, "yy-mm-dd hh:mm:ss:ms");
      this.devObj[item.devId].push(item);
    });
  }
  processPerTrack(time) {
    //保存一帧的数据
    let _drawObj = {};
    let list = [];
    for (let devId in this.devObj) {
      let devCacheData = this.devObj[devId];
      if (devCacheData && devCacheData.length > 0) {
        let devData = this.getMinValue(devId, time, devCacheData);
        if (!devData.data) {
          // console.log("没有找到相应的值")
          return;
        }
        let fusionList = devData.data.data;
        if (fusionList.length) {
          _drawObj[devId] = fusionList;
          list.push.apply(list, fusionList);
        }
        // return devData;
      } else {
        // console.log("缓存队列里没有值")
      }
    }
    this.drawObj = _drawObj;
    // console.log("集合的长度：" + list.length);
    this.processPerceptionMesage(list);

  }
  getMinValue(devId, time, cacheData) {
    let rangeData = null;
    let startIndex = -1;
      let minIndex = -1;
      let minData = {};
      let minDiff;
    //找到满足条件的范围
    for (let i = 0; i < cacheData.length; i++) {
      let diff = Math.abs(time - cacheData[i].gpsTime);
      // console.log(devId,cacheData.length,time,parseInt(cacheData[i].gpsTime),diff,i)
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
          minDiff=diff;
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
    } else {
      minIndex = 0;
      minData = cacheData[0];
      minDiff = Math.abs(time - minData.gpsTime);
      for (let i = 0; i < cacheData.length; i++) {
        let diff = Math.abs(time - parseInt(cacheData[i].gpsTime));
        if (diff < minDiff) {
          minData = cacheData[i];
          minIndex = i;
          minDiff=diff;
        }

      }
    }

    // console.log("最小索引:" + minIndex);
    if (minDiff && minDiff > this.perMaxValue) {
      // console.log("per找到最小值无效")
      return;
    }
      //打印出被舍弃的点
      let lostData = cacheData.filter((item, index) => {
          return index < minIndex;
      })
      // if(lostData.length>0){
      //     console.log("丢失数据长度",lostData.length);
      // }
    //返回距离标尺的最小插值的数据
    return {
      index: minIndex,
      data: minData
    };
  }
  //绘制感知车
  processPerceptionMesage(fusionList, miniLabel=false) {
    let _this = this;
    try {
      // _this.processPerceptionDataIntervalId = setInterval(() => {
      if (_this.deviceModels == undefined) return;
      // console.log("开始绘制");
      this.clearModel(fusionList);
      if (fusionList.length <= 0) return;
      for (let i = 0; i < fusionList.length; i++) {
        let d = fusionList[i];

        if (d.type == 1) {
          //平台车
          continue;
        }
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
    let carModel = this.getModelForPrimitive(d.vehicleId + name);//this.deviceModels.cars[d.vehicleId+"car"];
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
        if (primitive instanceof Cesium.Model && primitive.id.search("carbox") != -1 || primitive.id.search("person") != -1 || primitive.id.search("bicycle") != -1 ||
          primitive.id.search("motorbike") != -1 || primitive.id.search("bus") != -1 || primitive.id.search("truck") != -1) {
          this.viewer.scene.primitives.remove(primitive);
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
   * @param {数据} d
   */
  addModeCar(isAnimation, d, name, glbName) {
    var position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, this.defualtZ);
    var heading = Cesium.Math.toRadians(d.heading);
    var pitch = 0;
    var roll = 0;
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    let fixedFrameTransforms = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')
    var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransforms)

    let model = this.viewer.scene.primitives.add(Cesium.Model.fromGltf({
      id: d.vehicleId + name,
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
    for (var i = 0; i < primitives.length; i++) {
      var primitive = primitives.get(i);
      if (primitive.id) {
        if (primitive instanceof Cesium.Model && !primitive.show && primitive.id.search(name) != -1) {
          this.viewer.scene.primitives.remove(primitive);
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
    let veh = d.vehicleId.substr(0, 4) + "_" + d.vehicleId.substring(d.vehicleId.length - 4);
    // let text = "[" + h + ", " + s + ", " + veh + "]";
    // let text = "[" + veh + ", " + h + "°]";
    let text = veh;

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
    // let text = "[" + h + ", " + s + ", " + veh + "]";
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