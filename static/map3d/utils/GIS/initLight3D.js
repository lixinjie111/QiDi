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
    initlight(viewer, dataLight) {
        if (!dataLight) return;
        for (let i = 0; i < dataLight.length; i++) {

            //增加杆模型
            GisUtils.loadModelColl(viewer, dataLight[i].lampPos.split(',')[0], dataLight[i].lampPos.split(',')[1], dataLight[i].heading, 'B1', true);
            //增加红绿灯
            for (let j = 0; j < dataLight[i].spats.length; j++) {
                if (dataLight[i].spats[j].poleRelative) {
                    let L = new light3D();
                    let type = 0;
                    if (dataLight[i].type.indexOf('B') != -1) { //判断类型
                        type = 0;
                    }
                    else if (dataLight[i].type.indexOf('L') != -1) {
                        type = 1;
                    }
                    else if (dataLight[i].type.indexOf('T') != -1) {
                        type = 2;
                    }
                    let xyR = [], xyL = [];
                    let x = parseFloat(dataLight[i].lampPos.split(',')[0]);//经度
                    let y = parseFloat(dataLight[i].lampPos.split(',')[1]);//维度

                    if (dataLight[i].spats[j].poleRelative == 2) //右边红绿灯
                    {
                        if (xyR.length == 0) {
                            xyR = L.addLight(viewer, dataLight[i].spats[j].spatId, x, y, dataLight[i].heading - 90, type);
                        }
                        else {
                            xyR = L.addLight(viewer, dataLight[i].spats[j].spatId, xyR[0], xyR[1], dataLight[i].heading - 90, type);
                        }

                    }
                    else if (dataLight[i].spats[j].poleRelative == 1) {
                        if (xyL.length == 0) {
                            let index = parseInt(dataLight[i].type.substring(1, 2));
                            xyL = L.addLight(viewer, dataLight[i].spats[j].spatId, x - Math.sin(180 * (Math.PI / 180)) * 0.00003 * index, y - Math.cos(180 * (Math.PI / 180)) * 0.00003 * index);
                        }
                        else {
                            xyL = L.addLight(viewer, dataLight[i].spats[j].spatId, xyL[0], xyL[1], dataLight[i].heading - 90, type);
                        }
                    }
                    this.light3DList.push(L);
                }

            }
        }

    }
}