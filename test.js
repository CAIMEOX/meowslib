const MeoWS = require('meowslib');
const WSServer = MeoWS.WSServer;
const BuildSession = MeoWS.BuildSession;
const Collector = MeoWS.Collector;
const Commander = MeoWS.Commander;
const Builder = MeoWS.Builder;
const Parser = MeoWS.Parser;
let wss = new WSServer(23333);

wss.on('client', (session, request) => {
	this.co = new Collector(session);
	this.r = new Builder(session, this.co);
	console.log(request.connection.remoteAddress + ' connected!');
	session.tellraw('MeoWebsocket library v0.0.1 by CAIMEO.');
	BuildSession.createAndBind(session);
	this.co.getPosition('@s').then((v)=>{
		session.tellraw(session.now() + 'Position get: ' + v.join(' '));
	});
	session.on('onMessage',(msg, player)=>{
		let build_config = new Parser(msg,{},Object.keys(this.r.methods));
		build_config.forEach((config) => {
			if(!config.exec)return;
			let blocks = this.r.methods[config.exec](config);
			if(!blocks)return;
			session.sendCommandQueue(Commander.setTile(blocks,{
				position:this.co.last.position,
				block:'stained_glass'
			}),0,true);
		})
		//console.log(`[${player}]Message: `, msg);
	});
	session.on('onError',(e)=>{
		//发生错误时
		//console.log('onError: ', e);
	});
});
