
let gis3d=new GIS3D();
let perceptionCars = new PerceptionCars();
let perceptionWebsocket = {};
/** 调用 **/
$(function() {
    initMap3D();

    addEvent();
  

});

function initMap3D(){
    gis3d.initload("cesiumContainer",false);
    perceptionCars.viewer=gis3d.cesium.viewer; 
    //初始化地图--道路数据
    GisData.initRoadDate(gis3d.cesium.viewer);
    //初始化地图服务--上帝视角时使用
    GisData.initServer(gis3d.cesium.viewer);
    //初始化模型数据--树
    GisData.initThreeData(gis3d.cesium.viewer);
}


function addEvent(){

    addEventListener('message', e => {
        // e.data为父页面发送的数据
       let eventData = e.data
        if(eventData.type == "updateCam"){
          let {x, y, z, radius, pitch, yaw} = eventData.data;
          gis3d.updateCameraPosition(x, y, z, radius, pitch, yaw);
        }
        if(eventData.type == "position"){
          getData(eventData);
        }
        if(eventData.type == "addModel"){    
          gis3d.addModeCar({
            longitude:eventData.data.longitude,
            latitude:eventData.data.latitude,
            heading:eventData.data.heading,
            vehicleId:eventData.data.vehicleId,
          },
          eventData.data.name,
          eventData.data.glbName,
          );
        }
    })

}

function getData(e) {
    perceptionWebsocket = new WebSocket(window.config.socketUrl);  //获得WebSocket对象

    perceptionWebsocket.addEventListener('open', function (event) { 
      var perception = {
        action:"road_real_data_per",
        data:{
            type:1,
            // polygon:[[121.17403069999999,31.2836193],[121.1760307,31.2836193],[121.1760307,31.2816193],[121.17403069999999,31.2816193]]
            polygon:e.data.currentExtent
            }
      }
      var perceptionMsg = JSON.stringify(perception);
      perceptionWebsocket.send(perceptionMsg);
    });
    perceptionWebsocket.addEventListener('message', function (event) {
      let data = JSON.parse(event.data)
      let maxGpsTime = 0;
      let fiterData;
      if(data.result.perList.length){
        data.result.perList.map(item=>{
          if(item.gpsTime > maxGpsTime){
            maxGpsTime = item.gpsTime;
            fiterData = item;
          }
        })        
      }  
      perceptionCars.addPerceptionData(fiterData.data,0);      
    });
    perceptionWebsocket.addEventListener('close', function (event) {
      console.log("关闭链接")        
    });
    perceptionWebsocket.addEventListener('error', function (event) {
      console.log("链接出错")      
    });
}