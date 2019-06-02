const MeoWS = require('meowslib');
const WSServer = MeoWS.WSServer;
const BuildSession = MeoWS.BuildSession;
let wss = new WSServer(23333);

wss.on('client', (session, request) => {
	console.log(request.connection.remoteAddress + ' connected!');
	session.tellraw('MeoWebsocket library v0.0.1 by CAIMEO.');
	BuildSession.createAndBind(session);
	session.on('onMessage',(msg, player)=>{
		if(msg[0] == '=' ){
			session.sendCommand(msg.substr(1,msg.length), (result) => {
				session.tellraw(JSON.stringify(result));
			});
		}
		//当服务器接收到玩家发出信息
		console.log(`[${player}]Message: `, msg);
	});
	session.on('onCommand',(json)=>{
		//当玩家发送了一个Chat命令
		console.log('CommandOptions: ', json);
	});
	session.on('onJSON',(json)=>{
		//JSON
		console.log('onJSON: ', json);
	});
	session.on('onError',(e)=>{
		//发生错误时
		console.log('onError: ', e);
	});
});
