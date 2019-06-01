const WSServer = require('./src/mcpews');
const BuildSession = require('./src/session');
var wss = new WSServer(23333);

wss.on('client', (session, request) => {
	console.log(request.connection.remoteAddress + ' connected!');
	session.sendText('Libmcwebsocket v 0.0.1 by CAIMEO.')
	BuildSession.createAndBind(session);
	session.on('onMessage',(msg, player)=>{
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
