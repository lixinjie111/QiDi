/**
 * 实时接口发送
 */
class WebSocketObj {
    constructor(url = '', params = {}, callback){
    	this.webSocketUrl = url;
    	this.params = params;
    	this.callback = callback;
    	this.webSocket = null;
    	this.connectCount = 0;
        this.initWebSocket();
    }
    initWebSocket(){
        try{
            if ('WebSocket' in window) {
                this.webSocket = new WebSocket(this.webSocketUrl);  //获得WebSocket对象
                this.webSocket.onmessage = this.onMessage.bind(this);
                this.webSocket.onclose = this.onClose.bind(this);
                this.webSocket.onopen = this.onOpen.bind(this);
                this.webSocket.onerror=this.onError.bind(this);
            }else{
                this.$message("此浏览器不支持websocket");
            }
        }catch (e){
            this.reconnect();
        }

    }
    onMessage(message){
        this.callback(message);
    }
    onClose(){
        console.log("结束连接:"+this.params.action);
        this.connectCount = 0;
    }
    onError(){
        console.log("连接error:"+this.params.action);
        this.reconnect();
    }
    onOpen(){
        let _params = JSON.stringify(this.params);
        this.sendMsg(_params);
    }
    sendMsg(params) {
        if(window.WebSocket){
            if(this.webSocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                this.webSocket.send(params); //send()发送消息
                this.connectCount = 0;
            }
        }else{
            return;
        }
    }
    reconnect(){
        //重连不能超过5次
        if(this.connectCount >= 5){
            return;
        }
        this.initWebSocket();
        //重连不能超过5次
        this.connectCount++;
    }
}