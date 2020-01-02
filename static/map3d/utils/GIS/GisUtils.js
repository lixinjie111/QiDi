/**
 * 三维公共方法类
 */
window.GisUtils = {
    /**
     * 加载灯杆
     */
    loadModelColl(viewer,x,y,heading,name, isHeading) {
        //添加路灯杆和信息牌 
        // console.log(item) 
            var entity = null;
            //合并写法
            var instances = [];
                var position = Cesium.Cartesian3.fromDegrees(x, y, 0);
                //  
                var heading = Cesium.Math.toRadians(0);
                //是否旋转
                if (isHeading) {
                    heading = Cesium.Math.toRadians(heading);
                }
                var pitch = Cesium.Math.toRadians(0);
                var roll = 0;
                var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
                var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
                instances.push({
                    modelMatrix: modelMatrix
                });
            viewer.scene.primitives.add(new Cesium.ModelInstanceCollection({
                url: '../../static/map3d/model/' + name + '.glb',
                instances: instances
            })); 
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
