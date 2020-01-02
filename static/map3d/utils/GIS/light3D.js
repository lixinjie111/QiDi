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
        // this.type=0;//对应等杆类型 0对应 柱形杆，1对应L型杆，2对应T型杆
        this.height=0;//高度
    }
    //增加红路灯
    addLight(viewer,id, x, y, angle,type) { 
        if(type==1)
        {
            this.height=4.5;
        }
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
                    x, y,this.height+ 4,
                    x + Math.sin(angle * (Math.PI / 180)) * 0.000009, y + Math.cos(angle * (Math.PI / 180)) * 0.000009, this.height+4,
                ]),
                material: new Cesium.ImageMaterialProperty({
                    image: new Cesium.CallbackProperty(_img1, false),
                    transparent: true,
                    orientation: Cesium.StripeOrientation.HORIZONTAL   //水平还是垂直，默认水平
                }),
                outline: false,
                minimumHeights: [this.height+3,this.height+ 3],
            }
        });
        let x2 = x + Math.sin(angle * (Math.PI / 180)) * 0.00001;
        let y2 = y + Math.cos(angle * (Math.PI / 180)) * 0.00001;

        viewer.entities.add({
            id: id + "ligth2",
            name: id + "ligth2",
            wall: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                    x2, y2, this.height+3.9,
                    x2 + Math.sin(angle * (Math.PI / 180)) * 0.000005, y2 + Math.cos(angle * (Math.PI / 180)) * 0.000005, this.height+3.9,
                ]),
                material: new Cesium.ImageMaterialProperty({
                    image: new Cesium.CallbackProperty(_img2, false),
                    transparent: true,
                    orientation: Cesium.StripeOrientation.HORIZONTAL   //水平还是垂直，默认水平
                }),
                outline: false,
                minimumHeights: [this.height+3.1,this.height+3.1],
            }
        });

        let x3 = x2 + Math.sin(angle * (Math.PI / 180)) * 0.000005;
        let y3 = y2 + Math.cos(angle * (Math.PI / 180)) * 0.000005;

        viewer.entities.add({
            id: id + "ligth3",
            name: id + "ligth3",
            wall: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                    x3, y3, this.height+3.9,
                    x3 + Math.sin(angle * (Math.PI / 180)) * 0.000005, y3 + Math.cos(angle * (Math.PI / 180)) * 0.000005, this.height+3.9,
                ]),
                material: new Cesium.ImageMaterialProperty({
                    image: new Cesium.CallbackProperty(_img3, false),
                    transparent: true,
                    orientation: Cesium.StripeOrientation.HORIZONTAL   //水平还是垂直，默认水平
                }),
                outline: false,
                minimumHeights: [this.height+3.1,this.height+3.1],
            }
        });
        let x4 = x3 + Math.sin(angle * (Math.PI / 180)) * 0.000005;
        let y4 = y3 + Math.cos(angle * (Math.PI / 180)) * 0.000005;
        let xy=[x4,y4]; 
        return xy;
    } 
} 