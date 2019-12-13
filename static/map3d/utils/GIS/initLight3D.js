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
    initlight(viewer) {
        let l276 = new light3D(); 
        l276.addLight2(this.cesium.viewer, "276", 121.17551589465815, 31.281617738453047, 250);
        this.light3DList.push(l276);

        let l275 = new light3D();
        l275.addLight2(this.cesium.viewer, "275", 121.17557385020773, 31.281633267595755, 250);
        this.light3DList.push(l275);

        let l277 = new light3D();
        l277.addLight2(this.cesium.viewer, "277", 121.17512933327903, 31.28169112844802, -30);
        this.light3DList.push(l277);

        let l278 = new light3D();
        l278.addLight2(this.cesium.viewer, "278", 121.17510881207043, 31.281747510005268, -30);
        this.light3DList.push(l278);

        let l282 = new light3D();
        l282.addLight2(this.cesium.viewer, "282", 121.17534995826606, 31.282071700494583, 60);
        this.light3DList.push(l282);

    }
}