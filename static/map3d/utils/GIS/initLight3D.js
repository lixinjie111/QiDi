/**
 * 初始化红路灯，并调用更新红路灯数据
 */
window.initLight3D = {
    light3DList: [],//灯集合
    /**
     * 
     * @param {} light 
     */
    updateLight(light) {
        this.light3DList.forEach(item => {
            if (item.id == light.id) {
                item.id = light.id;
                item.img1 = light.img1;
                item.img2 = light.img2;
                item.img3 = light.img3
            }
        })
    },
    /**
     * 
     * @param {地图视图} viewer 
     */
    initlight(viewer,data) {

//         let lights = '{"status":200,"message":"","data":{"lampPole":[{"spats":[{"lightPos":"121.175515894658147,31.2816177384530469,17.2018751525999996","lightDirection":"2","phaseId":[9],"spatId":"275"},{"lightPos":"121.175512059249741,31.2816164091917877,17.3258747482000004","lightDirection":"1","relative":1,"phaseId":[10],"spatId":"276"}],"lampPoleId":11111,"type":"T","heading":132.32321,"lampPos":"121.175512059249741,31.2816164091917877,17.3258747482000004"}]}}';

//         debugger
//         let dataLight = JSON.parse(lights).data.lampPole;
//         for (let i = 0; i < dataLight.length; i++) {
// debugger
//      GisUtils.loadModelColl(viewer,dataLight[0].lampPos.split(',')[0], dataLight[0].lampPos.split(',')[1],dataLight[0].heading,'I_RB',true);

//             for (let j = 0; j < dataLight[i].spats.length; j++) {
//                 if (dataLight[i].spats[j].relative) {
//                     let L = new light3D();
//                     let type = 0;
//                     if (type == "T") {
//                         type = 1;
//                     }
//                     let xyR = [], xyL = [];
//                     if (dataLight[i].spats[j].relative == 2) //右边红绿灯
//                     {
//                         if (xyR.length == 0) {
//                             xyR = L.addLight(viewer, "276", dataLight[0].lampPos.split(',')[0], dataLight[0].lampPos.split(',')[1], dataLight[0].heading, type);
//                         }
//                         else
//                         {
//                             xyR = L.addLight(viewer, "276", xyR[0], xyR[1], dataLight[0].heading, type);
//                         }
                       
//                     }
//                     else if (dataLight[i].spats[j].relative == 1) {
//                         if (xyL.length ==0) {
//                             xyL = L.addLight(viewer, "276", dataLight[0].lampPos.split(',')[0] , dataLight[0].lampPos.split(',')[1] , dataLight[0].heading, type);
//                         }
//                         else
//                         {
//                             xyL = L.addLight(viewer, "276", xyL[0], xyL[1], dataLight[0].heading, type);
//                         }
//                     }
//                     this.light3DList.push(L);
//                 }

//             }
//         }

        // let l276 = new light3D();
        // l276.addLight(viewer, "276", 121.17551589465815, 31.281617738453047, 250, 0);
        // this.light3DList.push(l276);

        // // let l275 = new light3D();
        // // l275.addLight2(viewer, "275", 121.17557385020773, 31.281633267595755, 250);
        // // this.light3DList.push(l275);

        // // let l277 = new light3D();
        // // l277.addLight2(viewer, "277", 121.17512933327903, 31.28169112844802, -30);
        // // this.light3DList.push(l277);

        // // let l278 = new light3D();
        // // l278.addLight2(viewer, "278", 121.17510881207043, 31.281747510005268, -30);
        // // this.light3DList.push(l278);

        // // let l282 = new light3D();
        // // l282.addLight2(viewer, "282", 121.17534995826606, 31.282071700494583, 60);
        // // this.light3DList.push(l282);

        // //////////测试L型杆
        // let l561 = new light3D();
        // let xy = l561.addLight(viewer, "561", 121.1849806, 31.2764686, 180, 1);
        // this.light3DList.push(l561);

        // let l562 = new light3D();
        // let xy2 = l562.addLight(viewer, "562", xy[0], xy[1], 180, 1);
        // l562.img3 = '../../static/images/light/red_2.png'
        // this.light3DList.push(l562);


        // let l59 = new light3D();
        // l59.addLight(viewer, "59", xy2[0], xy2[1], 180, 1);
        // l59.img3 = '../../static/images/light/red_3.png'
        // this.light3DList.push(l59);



        // // let xT = 121.1849806 - Math.sin(180 * (Math.PI / 180)) * 0.00012;
        // // let yT = 31.2764686 - Math.cos(180 * (Math.PI / 180)) * 0.00012;
        // // let l60 = new light3D();
        // // l60.addLight(viewer, "60", xT,yT, 180,1);
        // // l60.img3='../../static/images/light/red_4.png'
        // // this.light3DList.push(l60);



    }
}