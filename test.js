const MeoWS = require('meowslib');
const crypto = require('crypto');
const WSServer = MeoWS.WSServer;
const BuildSession = MeoWS.BuildSession;
const Collector = MeoWS.Collector;
const Commander = MeoWS.Commander;
const Builder = MeoWS.Builder;
const Parser = MeoWS.Parser;
const fs = require('fs');
let wss = new WSServer(16384);

wss.on('client', (session, request) => {
//init
	this.C = new Collector(session);
	this.B = new Builder(session, this.C);
	let js = fs.readFileSync('./nbt.js');
	this.B.loadScript('nbt',js.toString());
	console.log(request.connection.remoteAddress + ' connected!');
	session.tellraw(session.now() + 'FastBuilder connected!');
	BuildSession.createAndBind(session);
	this.C.getPosition().then((v)=>{
		session.tellraw(session.now() + 'Position get: ' + v.join(' '));
	});
	session.sendCommandSync('testfor @s').then((v) => {
		session.tellraw(session.now() + v.victim + '. Welcome to FastBuilder! Enjoy it:D');
		session.write('§ePowered by CAIMEO.');
	});


	session.on('onMessage',(msg, player)=>{
		let result = Commander.ParseConfig(new Parser(msg,{},Object.keys(this.B.methods)),this.B,this.C.config);
		//console.log(result)
		if(!result){
			return;
		}
		session.sendCommandQueue(result);
		/*build_config.forEach((config) => {
			if(!config.exec)return;
			//console.log("config:",Object.assign(config, this.C.config))
			let blocks = this.B.methods[config.exec](Object.assign(config, this.C.config));
			if(!blocks)return;
			if(config.probability){
				session.sendCommandQueue(Commander.ProbabilityBuilder(blocks,{
					position:this.C.config.position,
					probability:config.probability
				}),0,true);
			}else{
				session.sendCommandQueue(Commander.setTile(blocks,{
					block:'stained_glass'
				}),0,true);
			}
		});
		*/
	});


});
