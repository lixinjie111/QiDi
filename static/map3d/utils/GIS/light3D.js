/**
 * 红路灯类
 */
class light3D {
    constructor() {
        this.id;
        this.num = 0;
        this.img1 = '../../static/images/light/cross-red.png';
        this.img2 = '../../static/images/light/red_0.png';
        this.img3 = '../../static/images/light/red_0.png';
    }
    //增加红路灯
    addLight(viewer, id, x, y, angle, stRotation1, stRotation2, stRotation3) {
        //New color every time it's called
        let _this = this;
        let _img1 = function (time, result) {
            return _this.img1;
        };
        let _img2 = function (time, result) {
            return _this.img2;
        };
        let _img3 = function (time, result) {
            return _this.img3;
        };
        viewer.entities.add({
            id: id + "ligth1",
            name: id + "ligth1",
            polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights([
                    x, y, 5.0,
                    x, y, 3.2,
                    x - Math.sin(angle * (Math.PI / 180)) * 0.00001, y - Math.cos(angle * (Math.PI / 180)) * 0.00001, 3.2,
                    x - Math.sin(angle * (Math.PI / 180)) * 0.00001, y - Math.cos(angle * (Math.PI / 180)) * 0.00001, 5.0,
                ]),
                fill: true,
                perPositionHeight: true,
                rotation: Cesium.Math.toRadians(stRotation3),
                stRotation: Cesium.Math.toRadians(stRotation3),
                material: new Cesium.ImageMaterialProperty({
                    image: new Cesium.CallbackProperty(_img3, false),
                    transparent: true
                }),
                outline: false
            }
        });
        viewer.entities.add({
            id: id + "ligth2",
            polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights([
                    x, y, 3.2,
                    x, y, 5.0,
                    x + Math.sin(angle * (Math.PI / 180)) * 0.00001, y + Math.cos(angle * (Math.PI / 180)) * 0.00001, 5.0,
                    x + Math.sin(angle * (Math.PI / 180)) * 0.00001, y + Math.cos(angle * (Math.PI / 180)) * 0.00001, 3.2
                ]),
                // fill:true, 
                perPositionHeight: true,
                rotation: Cesium.Math.toRadians(stRotation2),
                stRotation: Cesium.Math.toRadians(stRotation2),
                material: new Cesium.ImageMaterialProperty({
                    image: new Cesium.CallbackProperty(_img2, false),
                    transparent: true
                }),
                outline: false
            }
        });
        let x2 = x + Math.sin(angle * (Math.PI / 180)) * 0.00001;
        let y2 = y + Math.cos(angle * (Math.PI / 180)) * 0.00001;
        viewer.entities.add({
            id: id + "ligth3",
            polygon: {

                hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights([
                    x2, y2, 3.0,
                    x2, y2, 5.2,
                    x2 + Math.sin(angle * (Math.PI / 180)) * 0.00002, y2 + Math.cos(angle * (Math.PI / 180)) * 0.00002, 5.2,
                    x2 + Math.sin(angle * (Math.PI / 180)) * 0.00002, y2 + Math.cos(angle * (Math.PI / 180)) * 0.00002, 3.0
                ]),
                // fill:true, 
                perPositionHeight: true,
                rotation: Cesium.Math.toRadians(stRotation1),
                stRotation: Cesium.Math.toRadians(stRotation1),
                material: new Cesium.ImageMaterialProperty({
                    image: new Cesium.CallbackProperty(_img1, false),
                    transparent: true
                }),
                outline: false
            }
        });
        // 
        // let x3=x+Math.sin(angle * (Math.PI / 180)) *0.00006;
        // let y3=y+Math.cos(angle * (Math.PI / 180)) *0.00006

        // let x4=x3+Math.sin(angle * (Math.PI / 180)) *0.00002;
        // let y4=y3+Math.cos(angle * (Math.PI / 180)) *0.00002

    }
    //增加红路灯
    addLight2(viewer, id, x, y, angle) {
        this.id=id;
        //New color every time it's called
        let _this = this;
        let _img1 = function (time, result) {
            return _this.img1;
        };
        let _img2 = function (time, result) {
            return _this.img2;
        };
        let _img3 = function (time, result) {
            return _this.img3;
        };

        viewer.entities.add({
            id: id + "ligth1",
            name: id + "ligth1",
            wall: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                    x, y, 5.1,
                    x + Math.sin(angle * (Math.PI / 180)) * 0.00002, y + Math.cos(angle * (Math.PI / 180)) * 0.00002, 5.1,
                ]),
                material: new Cesium.ImageMaterialProperty({
                    image: new Cesium.CallbackProperty(_img1, false),
                    transparent: true,
                    orientation: Cesium.StripeOrientation.HORIZONTAL   //水平还是垂直，默认水平
                }),
                outline: false,
                minimumHeights: [3, 3],
            }
        });
        let x2 = x + Math.sin(angle * (Math.PI / 180)) * 0.00002;
        let y2 = y + Math.cos(angle * (Math.PI / 180)) * 0.00002;

        viewer.entities.add({
            id: id + "ligth2",
            name: id + "ligth2",
            wall: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                    x2, y2, 4.8,
                    x2 + Math.sin(angle * (Math.PI / 180)) * 0.00001, y2 + Math.cos(angle * (Math.PI / 180)) * 0.00001, 4.8,
                ]),
                material: new Cesium.ImageMaterialProperty({
                    image: new Cesium.CallbackProperty(_img2, false),
                    transparent: true,
                    orientation: Cesium.StripeOrientation.HORIZONTAL   //水平还是垂直，默认水平
                }),
                outline: false,
                minimumHeights: [3.4,3.4],
            }
        });

        let x3 = x2 + Math.sin(angle * (Math.PI / 180)) * 0.00001;
        let y3 = y2 + Math.cos(angle * (Math.PI / 180)) * 0.00001;

        viewer.entities.add({
            id: id + "ligth3",
            name: id + "ligth3",
            wall: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                    x3, y3, 4.8,
                    x3 + Math.sin(angle * (Math.PI / 180)) * 0.00001, y3 + Math.cos(angle * (Math.PI / 180)) * 0.00001, 4.8,
                ]),
                material: new Cesium.ImageMaterialProperty({
                    image: new Cesium.CallbackProperty(_img3, false),
                    transparent: true,
                    orientation: Cesium.StripeOrientation.HORIZONTAL   //水平还是垂直，默认水平
                }),
                outline: false,
                minimumHeights: [3.4,3.4],
            }
        });

    }

} 