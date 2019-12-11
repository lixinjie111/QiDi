class light3D {
    constructor() {
        //viewer=null;
        this.idd;
        this.num=0; 
        this.img1;
        this.img2;
        this.img3;
        this.primitive;
    } 
      //增加红路灯
      addLight(viewer,id,x,y,angle,stRotation1,stRotation2,stRotation3)
    { 
        //New color every time it's called
        let _this=this; 
        let _img1=function (time, result) {
            return _this.img1;
        };
        let _img2=function (time, result) {
            return _this.img2;
        };
        let _img3=function (time, result) {
            return _this.img3;
        }; 
         viewer.entities.add({ 
            id:id+"ligth1",
            name:id+"ligth1",
            polygon : {
                hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights([ 
                    x,y, 5.5,
                    x,y, 3.0,
                    x-Math.sin(angle * (Math.PI / 180)) *0.00001 ,y-Math.cos(angle * (Math.PI / 180)) *0.00001, 3.0,
                    x-Math.sin(angle * (Math.PI / 180)) *0.00001 ,y-Math.cos(angle * (Math.PI / 180)) *0.00001 , 5.5,
                ]),
                fill:true, 
                perPositionHeight : true,
                rotation:  Cesium.Math.toRadians(stRotation3), 
                stRotation : Cesium.Math.toRadians(stRotation3),
                material:new Cesium.ImageMaterialProperty({
                                    image:new Cesium.CallbackProperty(_img3,false),
                                    transparent:true
                                }), 
                outline : false
            }
        });  
       viewer.entities.add({ 
            id:id+"ligth2",
            polygon : {
                hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights([
                    x,y, 3.0,
                    x,y, 5.5, 
                    x+Math.sin(angle * (Math.PI / 180)) * 0.00001 ,y+Math.cos(angle * (Math.PI / 180)) *0.00001 , 5.5,
                    x+Math.sin(angle * (Math.PI / 180)) *0.00001 ,y+Math.cos(angle * (Math.PI / 180)) *0.00001, 3.0 
                ]),
                // fill:true, 
                perPositionHeight : true,
                rotation:  Cesium.Math.toRadians(stRotation2), 
                stRotation : Cesium.Math.toRadians(stRotation2),
                material:new Cesium.ImageMaterialProperty({
                    image:  new Cesium.CallbackProperty(_img2, false),
                    transparent:true
                }), 
                outline : false
            }
        });
        let x2=x+Math.sin(angle * (Math.PI / 180)) * 0.00001 ;
        let y2=y+Math.cos(angle * (Math.PI / 180)) *0.00001;
       viewer.entities.add({ 
            id:id+"ligth3",
            polygon : {
                hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights([
                    x2,y2, 3.0,
                    x2,y2, 5.5, 
                    x2+Math.sin(angle * (Math.PI / 180)) * 0.00002 ,y2+Math.cos(angle * (Math.PI / 180)) *0.00002 , 5.5,
                    x2+Math.sin(angle * (Math.PI / 180)) *0.00002 ,y2+Math.cos(angle * (Math.PI / 180)) *0.00002, 3.0 
                ]),
                // fill:true, 
                perPositionHeight : true,
                rotation:  Cesium.Math.toRadians(stRotation1), 
                stRotation : Cesium.Math.toRadians(stRotation1),
                material:new Cesium.ImageMaterialProperty({
                    image:  new Cesium.CallbackProperty(_img1, false),
                    transparent:true
                }), 
                outline : false
            }
        });
    

    }
}
// export default light3D