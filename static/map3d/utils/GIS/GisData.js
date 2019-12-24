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
        var promise = Cesium.GeoJsonDataSource.load('../../static/map3d/data/bs.geojson');
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
        // viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../static/map3d/data/bs.geojson', {
        //     fill: Cesium.Color.ALICEBLUE.withAlpha(1).withAlpha(0.996),//.withAlpha(1)
        //     // stroke: Cesium.Color.fromCssColorString('#fff').withAlpha(0.996),// Cesium.Color.ORANGE, 
        //     // markerSymbol: '?',
        //     show: false
        // }));
        //绿化带
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../static/map3d/data/lhd.geojson', {
            fill: Cesium.Color.fromCssColorString('#758152').withAlpha(0.996),//.withAlpha(1)
            stroke: Cesium.Color.fromCssColorString('#758152').withAlpha(0.996),// Cesium.Color.ORANGE, 
            // markerSymbol: '?',
            // zIndex: 1,
            show: false
        }));

        //斑马线
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../static/map3d/data/bmx.geojson', {
            fill: Cesium.Color.fromCssColorString('#f3f3f3').withAlpha(0.996),
            stroke: Cesium.Color.fromCssColorString('#f3f3f3').withAlpha(0.996),// Cesium.Color.ORANGE, 
            // markerSymbol: '?',
            // zIndex: 2,
            show: false
        }));
        //感知区域
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../static/map3d/data/gzqy.geojson', {
            fill: Cesium.Color.fromCssColorString('#71446b').withAlpha(0.5),//'../../static/images/login-bg.jpg',//.withAlpha(1)
            stroke: Cesium.Color.fromCssColorString('#71446b').withAlpha(0.5),// Cesium.Color.ORANGE,  
            // markerSymbol: '?',
            // zIndex: 0,
            show: false
        }));
        //道路马路牙子

        let dlwbk = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../static/map3d/data/mlyz.geojson', {
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
        //                 image:'../../static/images/36.png',
        //                 color: Cesium.Color.fromCssColorString('#fff').withAlpha(0.8),
        //                 repeat : new Cesium.Cartesian2(4,4)
        //             })
        //     }
        // }).otherwise(function (error) {
        //     //Display any errrors encountered while loading.
        //     //window.alert(error);
        // }); 
        // //道路面
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../static/map3d/data/dlm.geojson', {
            fill: Cesium.Color.fromCssColorString('#626669').withAlpha(1),//.withAlpha(1)
            stroke: Cesium.Color.fromCssColorString('#626669').withAlpha(1),// Cesium.Color.ORANGE, 
            // markerSymbol: '?',
            // zIndex: 0,
            show: false
        }));
        //道路 长虚线
        let dcdx = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../static/map3d/data/dlcxx.geojson', {
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
        let dcxx = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../static/map3d/data/dldxx.geojson', {
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
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../static/map3d/data/step.geojson', {
            stroke: Cesium.Color.fromCssColorString('#c0c0c0').withAlpha(0.996),// Cesium.Color.ORANGE, new Cesium.Color(135,75,43,1)
            strokeWidth: 2,
            // markerSymbol: '?',
            show: false
        }));
        //道路直线
        let dlzx = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../static/map3d/data/dlzx.geojson', {
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
        let dlbk = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../static/map3d/data/dlwbk.geojson', {
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

        let itemSide = [ [ 121.17598714521128, 31.28088057501294 ] ,
        [ 121.17583954051652, 31.28121453087844 ] ,
        [ 121.175612257827467, 31.280952580747613 ] ,
        [ 121.175685991245373, 31.280818061572234 ] ,
        [ 121.175664447611183, 31.281590460614954 ] ,
        [ 121.175701325812014, 31.281753520985301 ] ,
        [ 121.175829309765248, 31.281861309748006 ] ,
        [ 121.175929762079093, 31.281883500994997 ] ,
        [ 121.175492968867729, 31.281331331623687 ] ,
        [ 121.175296622253455, 31.281815077913453 ] ,
        [ 121.175741834864027, 31.282074395999956 ] ,
        [ 121.175880143327305, 31.2821078652767 ] ,
        [ 121.175479314559254, 31.282141314322701 ] ,
        [ 121.175239731657726, 31.282517878589541 ] ,
        [ 121.1751763654608, 31.282114097756295 ] ,
        [ 121.175024706903301, 31.282369710072359 ] ,
        [ 121.174866691150896, 31.282601841860235 ] ,
        [ 121.175017548435349, 31.282813421331479 ] ,
        [ 121.174561547388492, 31.282940836730564 ] ,
        [ 121.173472876883594, 31.283710116271362 ] ,
        [ 121.173766087699221, 31.283810232485454 ] ,
        [ 121.174529203986779, 31.283321299519191 ] ,
        [ 121.174151264154787, 31.283291582524893 ] ,
        [ 121.17266019263846, 31.284232587057836 ] ,
        [ 121.17266919325553, 31.283982108373905 ] ,
        [ 121.172000762643208, 31.284128927080214 ] ,
        [ 121.170780423185619, 31.28450464631878 ] ,
        [ 121.170785388134888, 31.284708066393573 ] ,
        [ 121.170696729683314, 31.284406075694378 ] ,
        [ 121.17035653749744, 31.284292394877752 ] ,
        [ 121.170611479499811, 31.284100314715037 ] ,
        [ 121.170905247449767, 31.284142686492828 ] ,
        [ 121.171353621128816, 31.284180576169639 ] ,
        [ 121.171177965711934, 31.28446925607178 ] ,
        [ 121.171085827581564, 31.284577733589646 ] ,
        [ 121.171060572776568, 31.284676661904662 ] ,
        [ 121.171402884472712, 31.284392741868281 ] ,
        [ 121.171767116757124, 31.284384084229817 ] ,
        [ 121.16998147538952, 31.284190571623935 ] ,
        [ 121.170129936748722, 31.283986234868536 ] ,
        [ 121.169753159063575, 31.283853176073219 ] ,
        [ 121.169355193469642, 31.283953713627504 ] ,
        [ 121.168987720687625, 31.283770663939052 ] ,
        [ 121.169123588695697, 31.283570922292306 ] ,
        [ 121.168848084792359, 31.28344646475508 ] ,
        [ 121.168485448984313, 31.28351647587824 ] ,
        [ 121.168012016522312, 31.283294440762379 ] ,
        [ 121.167950905866093, 31.283063011107057 ] ,
        [ 121.167527429597968, 31.2831175926312 ] ,
        [ 121.167473359202717, 31.282895810135326 ] ,
        [ 121.167114657555928, 31.282992366228175 ] ,
        [ 121.166777321978543, 31.282903896870813 ] ,
        [ 121.166862288135817, 31.282731773511596 ] ,
        [ 121.166386363208019, 31.282832740554987 ] ,
        [ 121.166001208800466, 31.28257305482304 ] ,
        [ 121.165850980501261, 31.282753494171885 ] ,
        [ 121.166115351620391, 31.282792354213246 ] ,
        [ 121.165606280725044, 31.282732098985917 ] ,
        [ 121.16550030771478, 31.282521508082098 ] ,
        [ 121.165032810013258, 31.282682377970115 ] ,
        [ 121.164970930022434, 31.282476712720658 ] ,
        [ 121.164513489098013, 31.282634860315618 ] ,
        [ 121.164504745426598, 31.282440694502949 ] ,
        [ 121.164063973762879, 31.282599078703836 ] ,
        [ 121.163938750943203, 31.282392507531345 ] ,
        [ 121.163812523810421, 31.282581879730774 ] ,
        [ 121.163813171928282, 31.282376391890011 ] ,
        [ 121.16346543099796, 31.282552572410509 ] ,
        [ 121.16347258122768, 31.282355769777183 ] ,
        [ 121.163323112727738, 31.282539797014373 ] 
       ] 
        this.initTree(itemSide, viewer, "Htree",false);

        let itemBigTree = [
            [ 121.163961524021119, 31.282594034090753 ] ,
            [ 121.164272880406941, 31.282423895666589 ] ,
            [ 121.164851143401634, 31.282663671944189 ] ,
            [ 121.164797978703888, 31.282467200709817 ] ,
            [ 121.165313353560208, 31.2825103647173 ] ,
            [ 121.165944905954092, 31.282761040955688 ] ,
            [ 121.168239249654818, 31.283396432718707 ] ,
            [ 121.169789848072995, 31.284122623619183 ] ,
            [ 121.170584035227378, 31.28433561731967 ] ,
            [ 121.170756595029673, 31.284466361914003 ] ,
            [ 121.171296215403558, 31.284406024780978 ] ,
            [ 121.171033393845022, 31.284164205956369 ] ,
            [ 121.171667564037421, 31.284388637852789 ] ,
            [ 121.172063591602665, 31.284352507254749 ] ,
            [ 121.174500686204198, 31.283010742293367 ] ,
            [ 121.175728818651649, 31.281400609270658 ] ,
            [ 121.175749219731117, 31.281813207271185 ] ,
            [ 121.175269788620511, 31.281902104825921 ] ,
            [ 121.175468343422693, 31.28140713253277 ] ,
            [ 121.175842676513895, 31.281147522119241 ] 
           ] 
           this.initTree(itemBigTree, viewer, "BigTree",false);
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
    //             url: '../../static/map3d/model/street_lamp_two.glb',
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
            url: '../../static/map3d/model/' + name + '.glb',
            instances: instances
        }));
    }
},
    /**
       * 加载感知杆
       */
    initModel_pole(item, viewer)//初始化杆
    {
        var itemSide = null;
        if(typeof item == 'string') {
            itemSide = JSON.parse(item);
        }else {
            itemSide = item;
        }
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
                    position: Cesium.Cartesian3.fromDegrees(itemSide[i].longitude, itemSide[i].latitude, 10 + window.defualtZ),
                    text: itemSide[i].devName,
                    font: '14px sans-serif',
                    showBackground: true,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    pixelOffset: new Cesium.Cartesian2(0.0, 0),
                    // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.0),
                    scaleByDistance: new Cesium.NearFarScalar(200, 1, 2000, 0)
                });
                var position = Cesium.Cartesian3.fromDegrees(itemSide[i].longitude, itemSide[i].latitude, window.defualtZ);
                //  
                var heading = Cesium.Math.toRadians(itemSide[i].heading);
                var pitch = Cesium.Math.toRadians(0);
                var roll = 0;
                var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
                let fixedFrameTransforms = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')
                var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransforms)
  
                instances.push({
                    modelMatrix: modelMatrix
                });
            }
            viewer.scene.primitives.add(new Cesium.ModelInstanceCollection({
                url: '../../static/map3d/model/poleWith2Camera.glb',
                instances: instances,
            }));
        }
    }
}
// export default GisData;