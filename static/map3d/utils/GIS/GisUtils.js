/**
 * 三维公共方法类
 */
let GisUtils = {
    /**
     * 控制图层是否显示
     * @param {三维} viewer 
     * @param {是否显示} isShow 
     */
    isShowDataSources(viewer, isShow) {
        if (viewer.dataSources.length > 0) {
            for (var i = 0; i < viewer.dataSources.length; i++) {
                viewer.dataSources.get(i).show = isShow;
            }
        }
    },
    /**
     * 控制信号灯显示
     * @param {三维视图} viewer 
     * @param {是否显示，true，false} isShow 
     */
    isShowLights(viewer, isShow) {
        this.isShowModels(viewer, "B1", isShow);
        this.isShowModels(viewer, "L2", isShow);
        this.isShowModels(viewer, "L3", isShow);
        this.isShowModels(viewer, "T2", isShow);
        this.isShowModels(viewer, "T3", isShow);
        this.isShowLableModels(viewer, "ligth", isShow);
    },
    /**
     * 是否显示事件（预警信息）
     * @param {三维视图} viewer 
     * @param {是否显示，true，false} isShow 
     */
    isShowEvents(viewer, isShow) {
        this.isShowLableModels(viewer, "Event", isShow);
    },

    /**
     * 是否显示树
     * @param {三维视图} viewer 
     * @param {是否显示，true，false} isShow 
     */
    isShowTree(viewer, isShow) {
        this.isShowModels(viewer, "tree", isShow);
    },
    /**
     * 是否显示感知杆
     * @param {三维视图} viewer 
     * @param {是否显示，true，false} isShow 
     */
    isShowPole(viewer, isShow) {
        this.isShowModels(viewer, "pole", isShow);
        this.isShowLabelCollection(viewer, "pole", isShow);
    },
    /**
     * 是否显示模型，模型名称，是否显示
     */
   isShowModels(viewer, nameModels, isShow) {
        var primitives = viewer.scene.primitives;
        for (var i = 0; i < primitives.length; i++) {
            var primitive = primitives.get(i);
            if (primitive._url && primitive._url._url) {
                if (primitive._url._url.search(nameModels) != -1) {
                    primitive.show = isShow;
                }
            }
        }
    },
    /**
     * 是否展示信息
     * @param {三维} viewer 
     * @param {名称} nameModels 
     * @param {是否显示} isShow 
     */
    isShowLableModels(viewer, nameModels, isShow) {
        var entities = viewer.entities._entities._array;
        for (var i = 0; i < entities.length; i++) {
            if (entities[i].id) {
                if (entities[i].id.search(nameModels) != -1) {
                    entities[i].show = isShow;
                }
            }
        }
    },
     /**
     * 是否展示信息
     * @param {三维} viewer 
     * @param {名称} nameModels 
     * @param {是否显示} isShow 
     */
    isShowLabelCollection(viewer, nameModels, isShow) {
        var primitives = viewer.scene.primitives._primitives;
        for (var i = 0; i < primitives.length; i++) {
            if (primitives[i]._labels) {
                if(primitives[i]._labels.length&&primitives[i]._labels.length>0)
                {
                    for(var k=0;k<primitives[i]._labels.length;k++)
                    {
                        if (primitives[i]._labels[k].id.search(nameModels) != -1) {
                            primitives[i]._labels[k].show = isShow;
                        }
                    } 
                } 
            }
        }
    },
    /**
     *增加带文字的模型 【此方法适合加载红路灯，树等静态模型，不适合做单个车模型加载】
     * @param {三维视图} viewer 
     * @param {经度} x 
     * @param {维度} y 
     * @param {航向角} heading 
     * @param {名称} name 
     * @param {是否设置航向角} isHeading 
     * @param {模型编号} id 
     */
    loadModelColl(viewer, x, y, heading, name, isHeading, id) {
        //添加路灯杆和信息牌   
       // if(id)
        // {
        //     var position1 = Cesium.Cartesian3.fromDegrees(x, y, 5.0);
        //     let entityLabel = viewer.entities.add({
        //         id: id + "light",
        //         position: position1,
        //         point: {
        //             color: Cesium.Color.RED,    //点位颜色
        //             pixelSize: 0,         //像素点大小
        //             scaleByDistance: new Cesium.NearFarScalar(200, 0, 2000, 1)
        //         },
        //         label: {
        //             text: id + "," + heading,
        //             fillColor: Cesium.Color.fromCssColorString('#2f2f2f'),
        //             backgroundColor: Cesium.Color.fromCssColorString('#F5F5DC').withAlpha(0.5),
        //             font: '12px',
        //             showBackground: true,
        //             horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        //             pixelOffset: new Cesium.Cartesian2(0.0, 0),
        //             // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.5),
        //             scaleByDistance: new Cesium.NearFarScalar(200, 1, 2000, 0)
        //         }
        //     }); 
        // } 
        if(x&&y)
        {
            //合并写法
            var instances = []; 
            var position = Cesium.Cartesian3.fromDegrees(x, y, 0.0);
            //是否旋转
            if (isHeading) {
                heading = Cesium.Math.toRadians(heading);
            }
            else {
                heading = Cesium.Math.toRadians(0);
            }
            var pitch = Cesium.Math.toRadians(0);
            var roll = 0;
            // var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
            // var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
            var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
            let fixedFrameTransforms = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west')
            var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransforms) 
            instances.push({
                modelMatrix: modelMatrix
            });
            viewer.scene.primitives.add(new Cesium.ModelInstanceCollection({
                url: '../../static/map3d/model/' + name + '.glb',
                instances: instances
            }));
        }
        
    },
    //度数转换
    getRad(d) {
        var PI = Math.PI;
        return d * PI / 180.0;
    },
    /**
     * 获取两个经纬度之间的距离
     * @param lat1 第一点的纬度
     * @param lng1 第一点的经度
     * @param lat2 第二点的纬度
     * @param lng2 第二点的经度
     * @returns {Number}
     */
    getDistance(lat1, lng1, lat2, lng2) {
        var f = this.getRad((lat1 + lat2) / 2);
        var g = this.getRad((lat1 - lat2) / 2);
        var l = this.getRad((lng1 - lng2) / 2);
        var sg = Math.sin(g);
        var sl = Math.sin(l);
        var sf = Math.sin(f);
        var s, c, w, r, d, h1, h2;
        var a = 6378137.0;//The Radius of eath in meter.   
        var fl = 1 / 298.257;
        sg = sg * sg;
        sl = sl * sl;
        sf = sf * sf;
        s = sg * (1 - sl) + (1 - sf) * sl;
        c = (1 - sg) * (1 - sl) + sf * sl;
        w = Math.atan(Math.sqrt(s / c));
        r = Math.sqrt(s * c) / w;
        d = 2 * w * a;
        h1 = (3 * r - 1) / 2 / c;
        h2 = (3 * r + 1) / 2 / s;
        s = d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
        s = s / 1000;
        s = s.toFixed(2);//指定小数点后的位数。   
        return s;
    }
}
