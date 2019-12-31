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
        // viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../static/map3d/data/gzqy.geojson', {
        //     fill: Cesium.Color.fromCssColorString('#71446b').withAlpha(0.5),//'../../static/images/login-bg.jpg',//.withAlpha(1)
        //     stroke: Cesium.Color.fromCssColorString('#71446b').withAlpha(0.5),// Cesium.Color.ORANGE,  
        //     // markerSymbol: '?',
        //     // zIndex: 0,
        //     show: false
        // }));
        //道路马路牙子

        let dlwbk = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../static/map3d/data/a.as', {
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
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../static/map3d/data/01.js', {
            fill: Cesium.Color.fromCssColorString('#626669').withAlpha(1),//.withAlpha(1)
            stroke: Cesium.Color.fromCssColorString('#626669').withAlpha(1),// Cesium.Color.ORANGE, 
            // markerSymbol: '?',
            // zIndex: 0,
            show: false
        }));
        //道路 长虚线
        for(let i=1;i<5;i++)
        {
            let dcdx = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../static/map3d/data/dlcxx0'+i+'.geojson', {
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
        }
        

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
        for (let i = 1; i < 10; i++) {
            let dlzx = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../static/map3d/data/dlzx0'+i+'.geojson', {
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
        }

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

        let itemSide = [
            [121.17598714521128, 31.28088057501294],
            [121.17583954051652, 31.28121453087844],
            [121.175685991245373, 31.280818061572234],
            [121.175664447611183, 31.281590460614954],
            [121.175929762079093, 31.281883500994997],
            [121.175492968867729, 31.281331331623687],
            [121.175296622253455, 31.281815077913453],
            [121.175880143327305, 31.2821078652767],
            [121.175479314559254, 31.282141314322701],
            [121.175239731657726, 31.282517878589541],
            [121.1751763654608, 31.282114097756295],
            [121.175024706903301, 31.282369710072359],
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
            [121.170785388134888, 31.284708066393573],
            [121.170696729683314, 31.284406075694378],
            [121.170611479499811, 31.284100314715037],
            [121.171353621128816, 31.284180576169639],
            [121.171177965711934, 31.28446925607178],
            [121.171060572776568, 31.284676661904662],
            [121.171767116757124, 31.284384084229817],
            [121.16998147538952, 31.284190571623935],
            [121.169753159063575, 31.283853176073219],
            [121.169355193469642, 31.283953713627504],
            [121.168848084792359, 31.28344646475508],
            [121.168485448984313, 31.28351647587824],
            [121.167950905866093, 31.283063011107057],
            [121.167114657555928, 31.282992366228175],
            [121.166862288135817, 31.282731773511596],
            [121.166386363208019, 31.282832740554987],
            [121.165606280725044, 31.282732098985917],
            [121.16550030771478, 31.282521508082098],
            [121.164970930022434, 31.282476712720658],
            [121.164513489098013, 31.282634860315618],
            [121.164063973762879, 31.282599078703836],
            [121.16347258122768, 31.282355769777183],
            [121.163323112727738, 31.282539797014373],
            [121.176053703229556, 31.280313557361961],
            [121.176516211951665, 31.280139960575205],
            [121.176654538087917, 31.279706493300345],
            [121.177325907089724, 31.279470946622254],
            [121.177304721098707, 31.279202843668656],
            [121.178002860873491, 31.278670517506725],
            [121.178456013003455, 31.278324704666403],
            [121.178683807517032, 31.278434687984383],
            [121.179339846848009, 31.277933704933684],
            [121.17935965517556, 31.277635019143574],
            [121.180168289942387, 31.277028506267353],
            [121.18056452320576, 31.277039478427596],
            [121.181451316123145, 31.276646961961525],
            [121.18162377957718, 31.276374588131208],
            [121.186568038037208, 31.276370259317293],
            [121.186488101211282, 31.27613644772218],
            [121.188028651958675, 31.275721152159875],
            [121.187772485887706, 31.275550947522206],
            [121.188714298669908, 31.275122198418362],
            [121.189390926511507, 31.27425267325301],
            [121.189026683824224, 31.274311609618533],
            [121.189587699028095, 31.273223554433546],
            [121.189735150951151, 31.272340212698811],
            [121.189978232922229, 31.272434079430599],
            [121.189933290538306, 31.271534415543201],
            [121.189580539680634, 31.270756033785048],
            [121.189597205207022, 31.269284876574389],
            [121.189819914657846, 31.269413830128507],
            [121.190555501463322, 31.267999508912954],
            [121.19004525411853, 31.268230281021314],
            [121.190962386474141, 31.267533632469174],
            [121.191034375872263, 31.267164057743933],
            [121.191561425700058, 31.266644912327315],
            [121.192483745882683, 31.266453822806483],
            [121.192456574578515, 31.2667212440501],
            [121.162022573132035, 31.282192652500449],
            [121.16199542418228, 31.282436996846105],
            [121.161162869533158, 31.282400051572775],
            [121.160767176522995, 31.282068887075287],
            [121.160354480872911, 31.282511275296141],
            [121.16010239612821, 31.283200663899827],
            [121.159792342245709, 31.28308814285743],
            [121.160228751950768, 31.281460365821538],
            [121.160610000287008, 31.281256410786696],
            [121.160035262274675, 31.282185914947451]
        ]

        this.initTree(itemSide, viewer, "Htree", false);

        let itemBigTree = [
            [121.163961524021119, 31.282594034090753],
            [121.164272880406941, 31.282423895666589],
            [121.164851143401634, 31.282663671944189],
            [121.164797978703888, 31.282467200709817],
            [121.165313353560208, 31.2825103647173],
            [121.165944905954092, 31.282761040955688],
            [121.168239249654818, 31.283396432718707],
            [121.169789848072995, 31.284122623619183],
            [121.170584035227378, 31.28433561731967],
            [121.170756595029673, 31.284466361914003],
            [121.171296215403558, 31.284406024780978],
            [121.171033393845022, 31.284164205956369],
            [121.171667564037421, 31.284388637852789],
            [121.172063591602665, 31.284352507254749],
            [121.174500686204198, 31.283010742293367],
            [121.175728818651649, 31.281400609270658],
            [121.175749219731117, 31.281813207271185],
            [121.175269788620511, 31.281902104825921],
            [121.175468343422693, 31.28140713253277],
            [121.175842676513895, 31.281147522119241]
        ]
        this.initTree(itemBigTree, viewer, "bigTree", false);
    },
    /**
     * 初始化红路灯模型
     */
    initLightModel(viewer) {
        let itemSide2 = [[121.17551589465815, 31.281617738453047, 0.0, 250],
        [121.17510881207043, 31.281747510005268, 0.0, -10],
        [121.17533995826606, 31.282071700494583, 0.0, 60], [121.1849806, 31.2764686, 0.0, 270]]
        this.initTree(itemSide2, viewer, "I_RB", true);
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
        if (typeof item == 'string') {
            itemSide = JSON.parse(item);
        } else {
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
                    fillColor: Cesium.Color.WHITE,
                    backgroundColor: Cesium.Color.ROYALBLUE,
                    position: Cesium.Cartesian3.fromDegrees(itemSide[i].longitude, itemSide[i].latitude, 6.8 + window.defualtZ),
                    text: itemSide[i].devName,
                    font: '14px',
                    showBackground: true,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    pixelOffset: new Cesium.Cartesian2(0.0, 0),
                    // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.0),
                    scaleByDistance: new Cesium.NearFarScalar(100, 1.3, 1000, 0)
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