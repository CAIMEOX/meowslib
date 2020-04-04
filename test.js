const MeoWS = require('meowslib');
const WSServer = MeoWS.WSServer;
const BuildSession = MeoWS.BuildSession;
const Collector = MeoWS.Collector;
const Commander = MeoWS.Commander;
const Builder = MeoWS.Builder;
const Parser = MeoWS.Parser;
const fs = require('fs');
let wss = new WSServer(16384);
let acme = fs.readFileSync('./script/acme.js').toString();
wss.on('client', async (session, request) => {
	await new Promise((r)=>{setTimeout(r,1000)});
//init
	session.cmd = new Commander({});
	session.cmd.updateOptions({
		block:'iron_block',
		data:0
	})
	session.clr = new Collector(session);
	session.gen = new Builder(session);
	session.gen.loadScript('acme', acme);
	session.parser = new Parser(Object.keys(session.gen.methods));
	console.log(request.connection.remoteAddress + ' connected!');
	session.tellraw(session.now() + 'FastBuilder connected!');
	BuildSession.createAndBind(session);
	session.clr.getPosition().then((v)=>{
		session.cmd.updateOptions({position:v});
		session.tellraw(session.now() + 'Position get: ' + v.join(' '));
	});
	session.sendCommandSync('testfor @s').then((v) => {
		session.tellraw(session.now() + v.victim + '. Welcome to FastBuilder! Enjoy it:D');
		session.write('§ePowered by CAIMEO.');
	});

	session.on('onMessage',(msg, player)=>{
		let result = session.cmd.parseConfigs(session.parser.parsePipe(msg),session.gen.methods);
		if(!result){
			return;
		}
		if (result.err){
			session.tellraw(result.err);
			return
		}
		// console.log(result)
		session.sendCommandQueue(result, 0, true);
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
