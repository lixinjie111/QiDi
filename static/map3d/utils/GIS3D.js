/**
 * 地图基础库
 */
class GIS3D {
    constructor() {
        this.cesium = { viewer: null };
        this.modelsInforLabel = {};
        this.defualtZ = window.defualtZ;
        this.isload = false;
        this.isShowData = true;//是否显示道路图层 
    }
    //初始化地图
    initload(id, isFXAA) {
        let cesiumContainer = document.getElementById(id);
        this.initCesium(cesiumContainer); // Initialize Cesium renderer  
        if (!isFXAA) {
            this.cesium.viewer.scene.screenSpaceCameraController.minimumZoomDistance = window.defualtZ + 5; //距离地形的距离？这个值可以多测试几个值，，我这不太好描述
        }
    }
    initCesium(cesiumContainer) {
        this.cesium.viewer = new Cesium.Viewer(cesiumContainer, {
            projectionPicker: true,
            animation: false,  //动画控制不显示     
            timeline: false,
            geocoder: false,
            homeButton: false,
            sceneModePicker: false,
            baseLayerPicker: false,
            navigationHelpButton: false,
            fullscreenButton: false,
            vrButton: false,
            // orderIndependentTranslucency: false,
            baseLayerPicker: false, //是否显示图层选择控件
            infoBox: false, //是否显示点击要素之后显示的信息 
            scene3DOnly: true,
            imageryProvider: new Cesium.SingleTileImageryProvider({
                url: '../../static/map3d/images/back.png'//透明图片
            }),
            shouldAnimate: true,
            selectionIndicator: false
        });
        this.cesium.viewer.scene.globe.depthTestAgainstTerrain = false;
        // this.cesium.viewer.scene.postProcessStages.fxaa.enabled = true;
        this.cesium.viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];
        this.cesium.viewer.scene.screenSpaceCameraController.tiltEventTypes = [Cesium.CameraEventType.PINCH, Cesium.CameraEventType.RIGHT_DRAG];
        this.cesium.viewer.imageryLayers.remove(this.cesium.viewer.imageryLayers.get(1));
        // this.cesium.viewer.imageryLayers.removeAll();
        //   var terrainProvider = new Cesium.EllipsoidTerrainProvider();
        // this.cesium.viewer.scene.terrainProvider = terrainProvider;
        //解决面的问题
        this.cesium.viewer.scene.logarithmicDepthBuffer = false;

        //显示刷新率和帧率
        // this.cesium.viewer.scene.debugShowFramesPerSecond = true;

        //  this.cesium.viewer.scene.sun.glowFactor=100;
        this.cesium.viewer.scene.skyBox.show = false
        this.cesium.viewer.scene.sun.destroy(); //去掉太阳
        this.cesium.viewer.scene.sun = undefined; //去掉太阳
        this.cesium.viewer.scene.moon.destroy(); //去掉月亮
        this.cesium.viewer.scene.moon = undefined; //去掉月亮 
        this.cesium.viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#758152').withAlpha(1);
        this.cesium.viewer.scene.skyAtmosphere.show = false;

        // //裁切地图
        var coffeeBeltRectangle = Cesium.Rectangle.fromDegrees(72, 3, 136, 56);
        this.cesium.viewer.scene.globe.cartographicLimitRectangle = coffeeBeltRectangle;

        //去除版权信息
        this.cesium.viewer._cesiumWidget._creditContainer.style.display = "none";

        let _this = this;
        this.cesium.viewer.scene.camera.moveEnd.addEventListener(function () {
            if (_this.cesium.viewer.dataSources.length == 0) return;
            var currentMagnitude = _this.cesium.viewer.camera.getMagnitude();
            if (currentMagnitude <= 6373057.350774223) {
                if (_this.cesium.viewer.dataSources.length > 0) {
                    for (var i = 0; i < _this.cesium.viewer.dataSources.length; i++) {
                        _this.cesium.viewer.dataSources.get(i).show = _this.isShowData;
                    }
                }
                if (_this.cesium.viewer.imageryLayers.length == 2) {
                    if (_this.cesium.viewer.imageryLayers._layers[1]) {
                        _this.cesium.viewer.imageryLayers.get(1).show = false;
                    }
                }
            }
            else {
                if (_this.cesium.viewer.dataSources.length > 0) {
                    for (var i = 0; i < _this.cesium.viewer.dataSources.length; i++) {
                        _this.cesium.viewer.dataSources.get(i).show = _this.isShowData;
                    }
                }
                if (_this.cesium.viewer.imageryLayers.length == 2) {
                    if (!_this.cesium.viewer.imageryLayers._layers[1].show) {
                        _this.cesium.viewer.imageryLayers.get(1).show = true;
                    }
                }
            }
        })


        // this.textCar();
    }
    //路口显示范围 
    addRectangle(id, extent, color = '#0000ff', opacity = 0.1) {

        //路口显示范围
        let rec = this.cesium.viewer.entities.getById(id)
        if (!rec) {
            this.cesium.viewer.entities.add({
                id: id,
                rectangle: {
                    coordinates: Cesium.Rectangle.fromDegrees(extent[3][0], extent[3][1], extent[1][0], extent[1][1]),
                    material: Cesium.Color.AZURE.withAlpha(opacity),
                    outline: true,
                    height: 0,
                    // outlineColor: Cesium.Color.BLUE
                    outlineColor: Cesium.Color.fromCssColorString(color)
                }
            });
        }
        else {
            this.cesium.viewer.entities.getById(id).rectangle.coordinates = Cesium.Rectangle.fromDegrees(extent[3][0], extent[3][1], extent[1][0], extent[1][1]);
        }

    }
    //移除事件
    remove3DInforLabel(name) {
        let label = this.modelsInforLabel[name];
        if (label != null) {
            this.cesium.viewer.entities.remove(label);
            delete this.modelsInforLabel[name];
        }
    }
    /**
      * 修改事件数值
    */
    update3DInfoLabel(id, text) {
        let entities = this.cesium.viewer.entities.getById(id + "Event");
        if (entities) {
            this.cesium.viewer.entities.getById(id + "Event").label.text = text;
        }
    }
    //根据名称获取事件
    get3DInfoLabel(id) {
        let entities = this.cesium.viewer.entities.getById(id + "Event");
        if (entities) {
            return this.cesium.viewer.entities.getById(id + "Event").label.text
        }

    }
    //添加事件
    add3DInfoLabel(name, text, x, y, z = 0,isShow=true) {
        if (name) {
            let positions = [];
            positions.push(Cesium.Cartesian3.fromDegrees(x, y, window.defualtZ + 0));
            positions.push(Cesium.Cartesian3.fromDegrees(x, y, window.defualtZ + 7.5));
            let lableModel = this.cesium.viewer.entities.add({
                show:isShow,
                id: name + "Event",
                position: Cesium.Cartesian3.fromDegrees(x, y, window.defualtZ + 7.5),
                polyline: {
                    positions: positions,
                    width: 2,
                    material: Cesium.Color.fromCssColorString('#ab6503'),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 1000.0)
                },
                label: {
                    text: text,
                    backgroundColor: Cesium.Color.fromCssColorString('#894b2b'),
                    font: '30px sans-serif',
                    showBackground: true,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    pixelOffset: new Cesium.Cartesian2(0.0, 0),
                    scaleByDistance: new Cesium.NearFarScalar(100, 1, 1000, 0)
                }
            });

            this.modelsInforLabel[name] = lableModel;
        }
    }
    getExtent() {
        // this.cesium.viewer
    }
    /**
     * 获取相机参数
     */
    getCamera() {
        var cartesian3 = new Cesium.Cartesian3(this.cesium.viewer.camera.position.x, this.cesium.viewer.camera.position.y, this.cesium.viewer.camera.position.z);
        var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var alt = cartographic.height;

        let obj = {
            x: lng,
            y: lat,
            z: alt,
            radius: Cesium.Math.toDegrees(this.cesium.viewer.camera.heading),
            pitch: this.cesium.viewer.camera.pitch,
            yaw: this.cesium.viewer.camera.roll
        };
        return obj;
    }

    addModel(name, url, x, y, z, labelName) {
        //添加模型
        let itemSide = [x, y, z]
        var h1 = 360;
        var h = -90 + h1;
        var heading = Cesium.Math.toRadians(h);
        //合并写法
        var instances = [];

        if (labelName) {
            var labels = this.cesium.viewer.scene.primitives.add(new Cesium.LabelCollection());
            labels.add({
                fillColor: Cesium.Color.BLACK,
                backgroundColor: Cesium.Color.fromCssColorString('#fff'),
                position: Cesium.Cartesian3.fromDegrees(itemSide[0], itemSide[1], itemSide[2] + 11),
                text: labelName,
                font: '10px sans-serif',
                showBackground: true,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                pixelOffset: new Cesium.Cartesian2(0.0, 0),
                scaleByDistance: new Cesium.NearFarScalar(1000, 1, 8000, 0)
            });
        }

        var position = Cesium.Cartesian3.fromDegrees(itemSide[0], itemSide[1], 0);
        var pitch = Cesium.Math.toRadians(0);
        var roll = 0;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
        instances.push({
            modelMatrix: modelMatrix
        });
        this.cesium.viewer.scene.primitives.add(new Cesium.ModelInstanceCollection({
            id: name,
            url: url,
            instances: instances,
        }));

    }
    //定位地图
    updateCameraPosition(x, y, z, radius = 0, pitch = 0, yaw = 0, duration = 0) {
        var heading = Cesium.Math.toRadians(radius);
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, yaw);
        this.cesium.viewer.camera.flyTo({
            duration: duration,
            destination: Cesium.Cartesian3.fromDegrees(x, y, z),
            orientation: hpr
        });
    }

    zoomModule(x, y, z, radius = 0, pitch = 0, yaw = 0, duration = 0) {
        let rect = Cesium.Rectangle.fromDegrees(x - 0.0001, y - 0.0001, x + 0.0001, y + 0.0001);
        let loactionTectEntity = this.cesium.viewer.entities.add({
            name: 'locationRectangle',
            id: 'locationRectangle',
            rectangle: {
                coordinates: rect,
                material: Cesium.Color.GREEN.withAlpha(1.0),
                height: 10.0,
                outline: false
            }
        });
        var heading = Cesium.Math.toRadians(radius);
        var flyPromise = this.cesium.viewer.flyTo(loactionTectEntity, {
            duration: 0,
            offset: new Cesium.HeadingPitchRange(heading, pitch)
        });
        let _this = this;
        flyPromise.then(function () {

            var center = Cesium.Rectangle.center(rect);
            var car = Cesium.Cartesian3.fromRadians(center.longitude, center.latitude);
            var range = Cesium.Cartesian3.distance(car, _this.cesium.viewer.camera.position) * Math.cos(20);

            _this.cesium.viewer.zoomTo(loactionTectEntity, new Cesium.HeadingPitchRange(heading, pitch, range));

            _this.cesium.viewer.entities.remove(loactionTectEntity);
        });
    }

    //二三维切换
    updatePosition(extend) {
        var rectangle = new Cesium.Rectangle.fromDegrees(extend[3][0], extend[3][1], extend[1][0], extend[1][1]);
        this.cesium.viewer.camera.flyTo({
            destination: rectangle
        });
    }
    //绘制面
    //绘制面
    addPolygon(hierarchy) {
        this.cesium.viewer.entities.add({
            polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray(hierarchy),
                height: 0.03,
                material: Cesium.Color.fromCssColorString('#6d596e').withAlpha(1),
                closetop: false,
                closeBottom: false,
                outline: false

            }
        });
    }
    /**
     * 增加车辆
     * @param {数据} d 
     */
    addModeAndPosition(d, name, glbName) {
        //利用entity进行加载
        var modleGlb = this.cesium.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude),
            name: d.vehicleId + name,
            model: {
                uri: '../../static/map3d/model/' + glbName + '.glb'
            }
        });
        //定位过去
        this.cesium.viewer.zoomTo(modleGlb);
    }
    addModeCar(d, name, glbName) {
        var position = Cesium.Cartesian3.fromDegrees(d.longitude, d.latitude, window.defualtZ);
        var heading = Cesium.Math.toRadians(d.heading);
        var pitch = 0;
        var roll = 0;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        let fixedFrameTransforms = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')
        var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransforms)

        let model = this.cesium.viewer.scene.primitives.add(Cesium.Model.fromGltf({
            id: d.vehicleId + name,
            modelMatrix: modelMatrix,
            url: '../../static/map3d/model/' + glbName + '.glb',
            minimumPixelSize: 1,
            show: true,
            maximumScale: 5,
            // color : Cesium.Color.fromAlpha(Cesium.Color.CHARTREUSE  , parseFloat(0)),
            // silhouetteColor : Cesium.Color.fromAlpha(Cesium.Color.RED, parseFloat(1)),//轮廓线
            colorBlendMode: Cesium.ColorBlendMode.Mix
            // ,
            // scale : 30.0     //放大倍数
            // debugWireframe:true
        }));


    }
    //测试绘制车
    textCar() {
        //添加路灯杆和信息牌
        let itemSide = [[121.17551589465815, 31.281617738453047, 0]]
        var h1 = 360;
        var h = -90 + h1;
        var heading = Cesium.Math.toRadians(h);
        // console.log(item)
        if (itemSide != null && itemSide.length > 0) {
            var entity = null;
            //合并写法
            var instances = [];
            var labels = this.cesium.viewer.scene.primitives.add(new Cesium.LabelCollection());
            for (var i = 0; i < itemSide.length; i++) {
                labels.add({
                    fillColor: Cesium.Color.BLACK,
                    backgroundColor: Cesium.Color.fromCssColorString('#fff'),
                    position: Cesium.Cartesian3.fromDegrees(itemSide[i][0], itemSide[i][1], 5),
                    text: "航向角" + h1,
                    font: '20px sans-serif',
                    showBackground: true,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    pixelOffset: new Cesium.Cartesian2(0.0, 0),
                    // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.0),
                    scaleByDistance: new Cesium.NearFarScalar(1000, 1, 8000, 0)
                });
                var position = Cesium.Cartesian3.fromDegrees(itemSide[i][0], itemSide[i][1], 5);
                //  

                var pitch = Cesium.Math.toRadians(0);
                var roll = 0;
                var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
                var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
                instances.push({
                    modelMatrix: modelMatrix
                });
            }
            let model = this.cesium.viewer.scene.primitives.add(new Cesium.ModelInstanceCollection({
                url: '../../static/map3d/model/carbox.glb',
                instances: instances,
                scale: 10.0
            }));
            //添加动画
            Cesium.when(model.readyPromise).then(function (model) {
                model.activeAnimations.addAll({
                    loop: Cesium.ModelAnimationLoop.REPEAT,//控制重复
                    speedup: 0.5, // 速度，相对于clock
                    reverse: false // 动画反转
                })
            });
        }
    }
    //释放模型
    destroyed() {
        this.cesium.viewer.scene.imageryLayers.removeAll()
        this.cesium.viewer.dataSources.removeAll();
        this.cesium.viewer.scene.primitives.removeAll();
        this.cesium.viewer.entities.removeAll();
    }
}
