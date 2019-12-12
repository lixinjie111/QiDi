/**
 * 日期时间格式化
 */
class webSocket {
    constructor(url = '', params = {}, callback){
    	this.webSocketUrl = url;
    	this.params = params;
    	this.callback = callback;
    	this.webSocket = null;
    	this.connectCount = null;
    }
    initWebSocket(){
        try{
            if ('WebSocket' in window) {
                this.websocket = new WebSocket(this.webSocketUrl);  //获得WebSocket对象
                this.websocket.onmessage = this.onMessage;
                this.websocket.onclose = this.onClose;
                this.websocket.onopen = this.onOpen;
                this.websocket.onerror=this.onError;
            }else{
                this.$message("此浏览器不支持websocket");
            }
        }catch (e){
            this.reconnect();
        }

    },
    onMessage(message){
        let json = JSON.parse(message.data);
        if(this.tabIsExist){
            platCars.receiveData(json,this.pulseNowTime,this.vehicleId);
        }
    },
    onClose(data){
        console.log("平台车结束连接");
        this.reconnect();
    },
    onError(){
        console.log("平台车连接error");
        this.reconnect();
    },
    onOpen(){
        let _params = JSON.stringify(this.params);
        this.sendMsg(_params);
    },
    sendMsg(params) {
        if(window.WebSocket){
            if(this.websocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                this.websocket.send(params); //send()发送消息
            }
        }else{
            return;
        }
    },
    reconnect(){
        //实例销毁后不进行重连
        if(this._isDestroyed){
            return;
        }
        //重连不能超过10次
        if(this.connectCount>=10){
            return;
        }
        this.initWebSocket();
        //重连不能超过5次
        this.connectCount++;
    },
}