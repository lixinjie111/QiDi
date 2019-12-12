/**
 * 地图数据及模型初始化
 */
var GisData = {
    /**
     * 初始化地图服务
     * @param {地图视图} viewer 
     */
    initServer(viewer) {
        //业务数据
        viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
            url: window.mapUrl,
            maximumLevel: 22,
            id: "layer1",
            show: false
        }));
    },
    //地图矢量数据初始化
    initRoadDate(viewer) {
        var promise = Cesium.GeoJsonDataSource.load('static/map3d/data/bs.geojson');
        promise.then(function (dataSource) {
            viewer.dataSources.add(dataSource);
            //Get the array of entities
            var entities = dataSource.entities.values;
            for (var i = 0; i < entities.length; i++) {
                //For each entity, create a random color based on the state name.
                //Some states have multiple entities, so we store the color in a
                //hash so that we use the same color for the entire state.
                var entity = entities[i];
                //Set the polygon material to our random color.
                entity.polygon.material = Cesium.Color.ALICEBLUE.withAlpha(1).withAlpha(0.996);
                //Remove the outlines.
                entity.polygon.outline = false;
            }
        }).otherwise(function (error) {
            //Display any errrors encountered while loading.
            // window.alert(error);
        });

        // //标识（箭头）
        // viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/bs.geojson', {
        //     fill: Cesium.Color.ALICEBLUE.withAlpha(1).withAlpha(0.996),//.withAlpha(1)
        //     // stroke: Cesium.Color.fromCssColorString('#fff').withAlpha(0.996),// Cesium.Color.ORANGE, 
        //     // markerSymbol: '?',
        //     show: false
        // }));
        //绿化带
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/lhd.geojson', {
            fill: Cesium.Color.fromCssColorString('#758152').withAlpha(0.996),//.withAlpha(1)
            stroke: Cesium.Color.fromCssColorString('#758152').withAlpha(0.996),// Cesium.Color.ORANGE, 
            // markerSymbol: '?',
            // zIndex: 1,
            show: false
        }));

        //斑马线
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/bmx.geojson', {
            fill: Cesium.Color.fromCssColorString('#f3f3f3').withAlpha(0.996),
            stroke: Cesium.Color.fromCssColorString('#f3f3f3').withAlpha(0.996),// Cesium.Color.ORANGE, 
            // markerSymbol: '?',
            // zIndex: 2,
            show: false
        }));
        //感知区域
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/gzqy.geojson', {
            fill: Cesium.Color.fromCssColorString('#71446b').withAlpha(0.5),//'static/images/login-bg.jpg',//.withAlpha(1)
            stroke: Cesium.Color.fromCssColorString('#71446b').withAlpha(0.5),// Cesium.Color.ORANGE,  
            // markerSymbol: '?',
            // zIndex: 0,
            show: false
        }));
        //道路马路牙子

        let dlwbk = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/mlyz.geojson', {
            fill: Cesium.Color.fromCssColorString('#c0c7c5').withAlpha(0.996),//.withAlpha(1)
            stroke: Cesium.Color.fromCssColorString('#c0c7c5').withAlpha(0.996),// Cesium.Color.ORANGE, 
            // markerSymbol: '?',
            // zIndex: 1,
            show: false
        }));
        // dlwbk.then(function (dataSource) {
        //     var entities = dataSource.entities.values;
        //     for (var i = 0; i < entities.length; i++) {
        //         var entity = entities[i];
        //         entity.polygon.material =   new Cesium.ImageMaterialProperty({
        //                 image:'./static/images/36.png',
        //                 color: Cesium.Color.fromCssColorString('#fff').withAlpha(0.8),
        //                 repeat : new Cesium.Cartesian2(4,4)
        //             })
        //     }
        // }).otherwise(function (error) {
        //     //Display any errrors encountered while loading.
        //     //window.alert(error);
        // }); 
        // //道路面
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/dlm.geojson', {
            fill: Cesium.Color.fromCssColorString('#626669').withAlpha(1),//.withAlpha(1)
            stroke: Cesium.Color.fromCssColorString('#626669').withAlpha(1),// Cesium.Color.ORANGE, 
            // markerSymbol: '?',
            // zIndex: 0,
            show: false
        }));
        //道路 长虚线
        let dcdx = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/dlcxx.geojson', {
            stroke: Cesium.Color.ALICEBLUE.withAlpha(0.996),// Cesium.Color.ORANGE, new Cesium.Color(135,75,43,1) 
            strokeWidth: 1,
            // markerSymbol: '?',
            show: false
        }));
        dcdx.then(function (dataSource) {
            var entities = dataSource.entities.values;
            for (var i = 0; i < entities.length; i++) {

                var entity = entities[i];
                entity.polyline.material = new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.ALICEBLUE.withAlpha(0.996),
                    dashLength: 10.0
                });
                entity.polyline.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 3000);
            }
        }).otherwise(function (error) {
            //Display any errrors encountered while loading.
            //window.alert(error);
        });

        //道路短虚线
        let dcxx = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/dldxx.geojson', {
            // stroke: Cesium.Color.ALICEBLUE.withAlpha(0.996),// Cesium.Color.ORANGE, new Cesium.Color(135,75,43,1)
            strokeWidth: 1,
            // markerSymbol: '?',
            show: false
        }));
        dcxx.then(function (dataSource) {
            var entities = dataSource.entities.values;
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                entity.polyline.material = new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.ALICEBLUE.withAlpha(0.996),
                    dashLength: 25.0
                })
                entity.polyline.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 3000);
            }
        }).otherwise(function (error) {
            //Display any errrors encountered while loading.
            //window.alert(error);
        });
        //停止线
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/step.geojson', {
            stroke: Cesium.Color.fromCssColorString('#c0c0c0').withAlpha(0.996),// Cesium.Color.ORANGE, new Cesium.Color(135,75,43,1)
            strokeWidth: 2,
            // markerSymbol: '?',
            show: false
        }));
        //道路直线
        let dlzx = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/dlzx.geojson', {
            stroke: Cesium.Color.fromCssColorString('#f3f3f3').withAlpha(0.996),// Cesium.Color.ORANGE, new Cesium.Color(135,75,43,1)
            strokeWidth: 1,
            // markerSymbol: '?',
            // zIndex: 1,
            show: false
        }));
        dlzx.then(function (dataSource) {
            var entities = dataSource.entities.values;
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                entity.polyline.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 3000);
            }
        }).otherwise(function (error) {
            //Display any errrors encountered while loading.
            //window.alert(error);
        });
        //道路外边框
        let dlbk = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('static/map3d/data/dlwbk.geojson', {
            stroke: Cesium.Color.fromCssColorString('#516b03').withAlpha(0.996),// Cesium.Color.ALICEBLUE.withAlpha(0.996),
            strokeWidth: 2,
            // markerSymbol: '?',
            show: false
        }));
        dlbk.then(function (dataSource) {
            var entities = dataSource.entities.values;
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                entity.polyline.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 500);
            }
        }).otherwise(function (error) {
            //Display any errrors encountered while loading.
            //window.alert(error);
        });
        //   dlbk.then(function(dataSource) {  
        //     var entities = dataSource.entities.values;  
        //     for (var i = 0; i < entities.length; i++) { 
        //         var entity = entities[i]; 
        //         entity.polyline.material=  new Cesium.PolylineGlowMaterialProperty({
        //             color : Cesium.Color.fromCssColorString('#954e2a').withAlpha(0.996),
        //             glowPower : 0.5
        //         }) 
        //     }
        // }).otherwise(function(error){
        //     //Display any errrors encountered while loading.
        //     //window.alert(error);
        // });
    },
    //初始化树模型
    initThreeData(viewer) {

        let itemSide = [
            [121.17598714521128, 31.28088057501294],
            [121.175908342116941, 31.281047481951688],
            [121.17583954051652, 31.28121453087844],
            [121.175536401947809, 31.281139577864504],
            [121.175612257827467, 31.280952580747613],
            [121.175685991245373, 31.280818061572234],
            [121.175723649439519, 31.28146015049041],
            [121.175696468940473, 31.281601655743426],
            [121.175664447611183, 31.281590460614954],
            [121.175664522932266, 31.281629842788995],
            [121.175673449548441, 31.281685819148183],
            [121.175701325812014, 31.281753520985301],
            [121.175737964301817, 31.281799150649082],
            [121.175788104035362, 31.281836379822408],
            [121.175829309765248, 31.281861309748006],
            [121.175929762079093, 31.281883500994997],
            [121.175428680496267, 31.281494864312084],
            [121.175492968867729, 31.281331331623687],
            [121.175384979402253, 31.281613938176438],
            [121.175296622253455, 31.281815077913453],
            [121.175222914078802, 31.282005924075772],
            [121.1756217388496, 31.282076508929997],
            [121.175741834864027, 31.282074395999956],
            [121.175880143327305, 31.2821078652767],
            [121.175479314559254, 31.282141314322701],
            [121.175401685924754, 31.282247137187259],
            [121.175378595494834, 31.282291679741359],
            [121.175322283976158, 31.282387303762761],
            [121.175239731657726, 31.282517878589541],
            [121.1751763654608, 31.282114097756295],
            [121.175024706903301, 31.282369710072359],
            [121.174930820308688, 31.282511579956843],
            [121.174976578769787, 31.282444446960984],
            [121.175115424717987, 31.282219202847099],
            [121.175195072147574, 31.282578463780379],
            [121.175093081476149, 31.2827154451723],
            [121.174866691150896, 31.282601841860235],
            [121.17474068202263, 31.282759365552955],
            [121.175017548435349, 31.282813421331479],
            [121.174561547388492, 31.282940836730564],
            [121.173472876883594, 31.283710116271362],
            [121.173766087699221, 31.283810232485454],
            [121.174529203986779, 31.283321299519191],
            [121.174151264154787, 31.283291582524893],
            [121.17266019263846, 31.284232587057836],
            [121.17266919325553, 31.283982108373905],
            [121.172000762643208, 31.284128927080214],
            [121.170780423185619, 31.28450464631878],
            [121.170801420709864, 31.284626191244545],
            [121.170785388134888, 31.284708066393573],
            [121.170696729683314, 31.284406075694378],
            [121.17035653749744, 31.284292394877752],
            [121.170365683787239, 31.284049078770582],
            [121.170611479499811, 31.284100314715037],
            [121.170905247449767, 31.284142686492828],
            [121.171353621128816, 31.284180576169639],
            [121.171141705053557, 31.284159419531221],
            [121.171177965711934, 31.28446925607178],
            [121.171085827581564, 31.284577733589646],
            [121.171060572776568, 31.284676661904662],
            [121.171402884472712, 31.284392741868281],
            [121.171767116757124, 31.284384084229817],
            [121.171622037735474, 31.284182965636113],
            [121.170097826441022, 31.284233602719066]
        ]

        this.initTree(itemSide, viewer, "Htree",false);
    },
    /**
     * 初始化红路灯模型
     */
    initLightModel(viewer) {
        let itemSide2 = [[121.17551589465815, 31.281617738453047, 0.0, 250],
        [121.17510881207043, 31.281747510005268, 0.0, -10],
        [121.17533995826606, 31.282071700494583, 0.0, 60]] 
        this.initTree(itemSide2, viewer, "traffic_light_yellow",true);
    },
    /**
     * 初始化感知杆模型
     */
    initPoleModelDate(item, viewer) {
        //var item = sessionStorage.getItem("sideList"); 
        if (item) {
            this.initModel_pole(item, viewer);
        }

    },
    // /**
    //  * 加载灯杆
    //  */
    // initStreetLamp(viewer) {
    //     //添加路灯杆和信息牌
    //     let itemSide = [[121.17070961131611, 31.285431834985424],
    //     [121.17073199482752, 31.285150145980502],
    //     [121.17096459641984, 31.285168614731074],
    //     [121.17101335020133, 31.284874000996314],
    //     [121.17216565958867, 31.284348054967808],
    //     [121.17132056475575, 31.284276048390208],
    //     [121.17062888598159, 31.284216686156945],
    //     [121.17207633906403, 31.284239285633543],
    //     [121.17033359249672, 31.284157141256838],
    //     [121.1724246115773, 31.284181289535567],
    //     [121.17273228554805, 31.28410708290532],
    //     [121.17014346973389, 31.28410722054608],
    //     [121.17127629880481, 31.284068493485837],
    //     [121.16975107570983, 31.283968732825787],
    //     [121.17071496967101, 31.284011572973593],
    //     [121.17889298098785, 31.284066496892297],
    //     [121.17308388024266, 31.283994517255138],
    //     [121.17513316747507, 31.28202608387663],
    //     [121.17507200103864, 31.2820481296404],
    //     [121.17643623104242, 31.28201254302679],
    //     [121.17608145380935, 31.28192863389644],
    //     [121.17571194801135, 31.281806498814234],
    //     [121.17554428210079, 31.281528392645594],
    //     [121.17551565124025, 31.28127144704202],
    //     [121.17596714717831, 31.280635936312137],
    //     [121.1757986743549, 31.280924816290394],
    //     [121.17617058471296, 31.280354153655722],
    //     [121.17639732682561, 31.280095618450176],
    //     [121.17656592321617, 31.279932812971882],
    //     [121.17673851919542, 31.279782646028156],
    //     [121.17626731462425, 31.279858345912515],
    //     [121.17710489311077, 31.279497024499808],
    //     [121.17692052173562, 31.27963787124529],
    //     [121.17750680578966, 31.27916958914152],
    //     [121.1775359306423, 31.27919272313663],
    //     [121.17778939558842, 31.278952815954426],
    //     [121.17781590654938, 31.2789796944684],
    //     [121.1666703978575, 31.282784858344815],
    //     [121.17477219004144, 31.28290573394953],
    //     [121.17760398758145, 31.28286933091194],
    //     [121.16578527647836, 31.282646589044464]]

    //     // console.log(item)
    //     if (itemSide != null && itemSide.length > 0) {
    //         var entity = null;
    //         //合并写法
    //         var instances = [];
    //         // var labels = viewer.scene.primitives.add(new Cesium.LabelCollection());
    //         for (var i = 0; i < itemSide.length; i++) {
    //             var position = Cesium.Cartesian3.fromDegrees(itemSide[i][0], itemSide[i][1], 0);
    //             //  
    //             var heading = Cesium.Math.toRadians(30);
    //             var pitch = Cesium.Math.toRadians(0);
    //             var roll = 0;
    //             var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    //             var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
    //             instances.push({
    //                 modelMatrix: modelMatrix
    //             });
    //         }
    //         viewer.scene.primitives.add(new Cesium.ModelInstanceCollection({
    //             url: './static/map3d/model/street_lamp_two.glb',
    //             instances: instances
    //         }));
    //     }
    // },

   /**
    * 加载灯杆
    */
   initTree(itemSide, viewer, name, isHeading) {
    //添加路灯杆和信息牌 
    // console.log(item)
    if (itemSide != null && itemSide.length > 0) {
        var entity = null;
        //合并写法
        var instances = [];
        for (var i = 0; i < itemSide.length; i++) {
            var position = Cesium.Cartesian3.fromDegrees(itemSide[i][0], itemSide[i][1], 0);
            //  
            var heading = Cesium.Math.toRadians(0);
            //是否旋转
            if (isHeading) {
                debugger
                heading = Cesium.Math.toRadians(itemSide[i][3]);
            }

            var pitch = Cesium.Math.toRadians(0);
            var roll = 0;
            var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
            var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
            instances.push({
                modelMatrix: modelMatrix
            });
        }
        viewer.scene.primitives.add(new Cesium.ModelInstanceCollection({
            url: './static/map3d/model/' + name + '.glb',
            instances: instances
        }));
    }
},
    /**
       * 加载感知杆
       */
    initModel_pole(item, viewer)//初始化杆
    {
        var itemSide = JSON.parse(item);
        // console.log(item)
        if (itemSide != null && itemSide.length > 0) {
            var entity = null;
            //合并写法
            var instances = [];
            var labels = viewer.scene.primitives.add(new Cesium.LabelCollection());
            for (var i = 0; i < itemSide.length; i++) {
                labels.add({
                    fillColor: Cesium.Color.BLACK,
                    backgroundColor: Cesium.Color.fromCssColorString('#fff'),
                    position: Cesium.Cartesian3.fromDegrees(itemSide[i].longitude, itemSide[i].latitude, 10 + this.defualtZ),
                    text: itemSide[i].devName,
                    font: '14px sans-serif',
                    showBackground: true,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    pixelOffset: new Cesium.Cartesian2(0.0, 0),
                    // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.0),
                    scaleByDistance: new Cesium.NearFarScalar(200, 1, 2000, 0)
                });
                var position = Cesium.Cartesian3.fromDegrees(itemSide[i].longitude, itemSide[i].latitude, this.defualtZ);
                //  
                var heading = Cesium.Math.toRadians(itemSide[i].heading + 90);
                var pitch = Cesium.Math.toRadians(0);
                var roll = 0;
                var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
                var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
                instances.push({
                    modelMatrix: modelMatrix
                });
            }
            viewer.scene.primitives.add(new Cesium.ModelInstanceCollection({
                url: './static/map3d/model/poleWith2Camera.glb',
                instances: instances,
            }));
        }
    }
}
// export default GisData;