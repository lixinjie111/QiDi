window.config = {

    //望京 内网 
    // url: 'http://172.17.1.16:9093/monPlatApp/', //监控平台
    // operateUrl: 'http://172.17.1.16:9090/operateApp/',	//运营平台
    // websocketUrl:'ws://172.17.1.16:9982/mon',  //监控
    // socketUrl:'ws://172.17.1.16:9999/ws',  //影子系统
 
    //望京 外网
    url: 'http://120.133.21.14:9093/monPlatApp/', //监控平台
    operateUrl: 'http://120.133.21.14:9090/operateApp/',    //运营平台
    websocketUrl:'ws://120.133.21.14:49982/mon',  //监控
    socketUrl:'ws://120.133.21.14:49999/ws',  //影子系统

    //上海正式环境  外网 
    // url: 'http://116.236.72.206:49093/monPlatApp/', //监控平台
    // operateUrl: 'http://116.236.72.204:49090/operateApp/', //运营平台
    // websocketUrl:'ws://116.236.72.206:49982/mon',  //监控
    // socketUrl:'ws://116.236.72.205:49999/ws',  //影子系统

    version: 1.0,       // 版本号
}

window.mapUrl=window.config.dlWmsUrl+"geoserver/gwc/service/wmts/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=shanghai_qcc:dl_shcsq_wgs84_zc_0709&STYLE=&FORMAT=image/png&TILEMATRIXSET=EPSG:900913&TileMatrix=EPSG:900913:{TileMatrix}&TileCol={TileCol}&TileRow={TileRow}"
window.defualtZ=0;
