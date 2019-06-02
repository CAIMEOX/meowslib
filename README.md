# MeoWebsocket library

## 简介
MWL是一个易于使用的Minecraft Websocket开发库

## 安装
`npm install meowslib`

## 代码实例
输出玩家聊天信息:
```js
const MeoWS = require('meowslib');
const WSServer = MeoWS.WSServer;
const BuildSession = MeoWS.BuildSession;
let wss = new WSServer(23333);

wss.on('client', (session, request) => {
	console.log(request.connection.remoteAddress + ' connected!');
	session.tellra代码w('MeoWebsocket library v2.0.0 by CAIMEO.');
	BuildSession.createAndBind(session);
	session.on('onMessage',(msg, player)=>{
		console.log(`[${player}]Message: `, msg);
	});
});
```

事件监听器(此处订阅了BlockPlaced事件):
```js
wss.on('client', (session, request) => {
	console.log(request.connection.remoteAddress + ' connected!');
	session.tellraw('MeoWebsocket library v2.0.0 by CAIMEO.');
	BuildSession.createAndBind(session);
  session.subscribe("BlockPlaced", (json) => {
    console.log("BlockPlaced:", json);
  })
});
```

## API 文档
### Class MeoWS.WSServer
- `port` {Number} 服务器端口

### Class MeoWS.BuildSession
- `socket` {Session} 一般绑定WSServerSession

### Class MeoWS.Parser
命令解析器
- `command` {String} 用户命令
- `options` {Object} 规则
返回一个Object

### Events
#### onMessage
当玩家发送消息时触发，传入信息内容和发送者
#### onJSON
当玩家发送消息时触发，不同的是，它将传回json
#### onError
发生错误时触发,传回i错误信息
#### onCommand
党玩家发送消息并被Parser解析完成时触发，传回object

### Session
#### sendCommand(command, callback)
向客户端发送命令
- command {String} 命令
- callback {Function} 回调函数，传入json

#### sendCommandSync(command)
向客户端发送命令(Promise)
- command {String} 命令

#### subscribe(event,callback)
订阅游戏事件
- event {String} 游戏事件
- callback {String}回调函数，传入json

#### unsubscribe(event)
取消订阅游戏事件
- event {String} 游戏事件

#### sendText(text)
发送信息
- text {String} 要发送的消息

#### tellraw(text, color)
tellraw代码
- text {String} 要发送的消息
- color {String} 颜色代码

