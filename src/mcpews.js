const EventEmitter = require('events');
const WebSocket = require('ws');
const os = require('os');
const randomUUID = require('uuid/v4');
const ProgressBar = require('./progressbar');
const log = require('./logger')
const Formation = new Map();
const Child_process = require('child_process');
class WSServer extends WebSocket.Server {
	constructor(port, processor) {
    log(`Server was running at ${getHost()}:${port}`);
		super({
			port: port
		});
		this.sessions = new Set();
		this.on('connection', onConn);
		
		if (processor) this.on('client', processor);
	}

	getSessions(name){
		this.sessions.forEach((v) => {
			if (v.name === name) {
				return v
			}
		});
		return null;
	}

	removeSessions(name) {
		this.getSessions(name).close();
		this.sessions.delete(this.getSessions(name));
	}

	removeAllSessions(){
		this.sessions.clear()
	}

	getAllSessions(){
		let sessions = new Map();
		let i = 0;
		this.sessions.forEach((v) => {
			sessions.set(`${i}:${v.name}`, v);
			i++
		});
		return sessions;
	}

	GlobalChat(user, message){
		this.sessions.forEach((v) => {
			if (v.name !== user) {
				v.tellraw(`[${user}] §c${message}`);
			}else {
				v.tellraw(`[You] §e${message}`)
			}
		});
	}

	getOnlinePlayers(){
		let nameSet = [];
		this.sessions.forEach((v) => {
			nameSet.push(v.name);
		});
		return nameSet;
	}

	getAllClientsIP(){
		let ip = [];
		this.sessions.forEach((v) => {
			ip.push(v.IP)
		})
		return ip;
	}
}

class Session extends EventEmitter {
	constructor(server, socket) {
		super();
		this.server = server;
		this.socket = socket;
		this.eventListeners = new Map();
		this.responsers = new Map();
		this.stop = true;
		this.answered = true;
		socket.on('message', onMessage.bind(this));
		socket.on('close', onClose.bind(this));
		
	}

	onChatMessage (msg, player) {
		this.emit('onMessage',msg, player);
	}

	question(question, callback) {
		this.tellraw(question);
		this.answered = false;
		this.onAns = callback;
	}


	subscribe(event, callback) {
		var listeners = this.eventListeners.get(event);
		if (!listeners) {
			listeners = new Set();
			this.eventListeners.set(event, listeners);
			this.socket.send(JSON.stringify({
				header: buildHeader('subscribe'),
				body: {
					eventName: String(event)
				}
			}),()=>{return});
		}
		listeners.add(callback);
	}

	unsubscribe(event, callback) {
		var listeners = this.eventListeners.get(event);
		if (listeners == undefined) {
			return;
		}
		listeners.delete(callback);
		if (listeners.size == 0) {
			this.eventListeners.delete(event);
			this.socket.send(JSON.stringify({
				header: buildHeader('unsubscribe'),
				body: {
					eventName: String(event)
				}
			}),()=>{return});
		}
	}

	sendCommand(command, callback) {
		var json = {
			header: buildHeader('commandRequest'),
			body: {
				version: 1,
				commandLine: command
			}
		};
		this.responsers.set(json.header.requestId, callback);
		this.socket.send(JSON.stringify(json),(e)=>{return});
		Formation.set(json.header.requestId, command);
		return json.header.requestId;
	}

	sendCommandSync(command) {
		return new Promise((done) => {
			let json = {
				header: buildHeader('commandRequest'),
				body: {
					version: 1,
					commandLine: command
				}
			};
			this.responsers.set(json.header.requestId, done);
			this.socket.send(JSON.stringify(json),(e)=>{return});
		});
	}

	sendText(text) {
		this.sendCommand('say ' + text);
	}

	tellraw(text, color) {
		this.sendCommand('tellraw @s ' + JSON.stringify({
			rawtext:[
				{
					text:color || "§e" + this.now() + text
				}
			]
		}));
	}

	setBlock(x, y, z, blockId, blockData) {
		blockData = blockData || 0;
		this.sendCommand(['setblock', x, y, z, blockId, blockData].join(' '));
	}

	shell(command, args, options){
		let $command = Child_process.spawn(command, args, options);
		$command.stdout.on('data',(data) => {
			this.tellraw('Terminal: ' + data);
		});
	}

	tryEval(code) {
		let result;
		try{
			result = eval(code);
		}catch(e){
			result = e;
		}
		return result;
	}

	close(reason){
		log('Connection closed: ' + reason);
		this.socket.terminate();
	}

	write(str){
		this.sendCommand('title @s actionbar ' + str);
	}

	now(){
		let date = new Date();
		return ['[',date.toTimeString().slice(0, 8),']'].join('');
	}

	sendCommandQueue(queue, time, bar){
		let t = 0;
		this.stop = false
		if(bar){
			
			let $bar = new ProgressBar('§bProgressBar: §e[:bar] §b:percent \n§eSchedule:§b[:current/:total] §eTime:§b[:elapsed::etas] §eSpeed:§b:rate block/s', {
				stream:this,
				total:queue.length,
				width:30,
				complete:'+',
				incomplete:'=',
				clear:true,
				callback:()=>{
					this.write('§bEverything is done!');
				}
			});
			let Sender = setInterval(() => {
				this.sendCommand(queue[t],() => {
					$bar.tick();
				});
				t++;
				if(t == queue.length || this.stop){
					if(this.stop)this.write('§eAnd nothing is allright!');
					clearInterval(Sender);
					this.stop = true;
				}
			},time);
		}else{
			let Sender = setInterval(() => {
				this.sendCommand(queue[t]);
				t++;
				if(t == queue.length || this.stop){
					clearInterval(Sender);
					this.stop = true;
				}
			},time);
		}
	}

	sendCommandQueueSync(queue){
		let t = 0;
		let that = this;
		function next(t){
			that.sendCommandSync(queue[t]).then((body) => {
				if(t === queue.length)return;
				t++;
				next(t);
			});
		}
		next(t);
	}
}

module.exports = WSServer;

function onConn(socket, req) {
	var session = new Session(this, socket);
	this.sessions.add(session);
	// console.log(this.getAllSessions().keys())
	this.emit('client', session, req);
}

function onClose() {
	// this.server.GlobalChat('Server', `${this.name} exited.`)
	this.server.sessions.delete(this);
}

function onMessage(message) {
	let json;
	try {
		json = JSON.parse(message);
		//this.emit('onJSON', message);
	}catch(e){
		//this.emit('onParseError', e);
		return;
	}
	var header = json.header;
	switch (header.messagePurpose) {
	case 'event':
		let listeners = this.eventListeners.get(json.body.eventName);
		if (listeners) {
			listeners.forEach((cb) => {
				try {
					cb(json.body, json);
				} catch(err) {
					this.emit('error', err);
				}
			},
			this);
		}
		
		break;
	case 'commandResponse':
		Formation.delete(header.requestId);
		let callback = this.responsers.get(header.requestId);
		this.responsers.delete(header.requestId);
		if (callback) {
			try {
				callback(json.body, json);
			} catch(err) {
				this.emit('error', err);
			}
		}
		break;
	case 'error':
		if (Formation.has(header.requestId)) {
			this.sendCommand(Formation.get(header.requestId));
		};
		this.emit('onError', new Error(json.body.statusMessage), json);
		break;
	}
}

function getHost() {
  let Network = os.networkInterfaces();
  return os.type() == 'Linux' ? Network[Object.keys(Network)[1]][0].address :
  Network[Object.keys(Network)[0]][1].address;
}

function buildHeader(purpose) {
	return {
		version: 1,
		requestId: randomUUID(),
		messagePurpose: purpose,
		messageType: 'commandRequest'
	};
}
