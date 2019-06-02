const EventEmitter = require('events');
const WebSocket = require('ws');
const os = require('os');
const randomUUID = require('uuid/v4');
const Formation = new Map();
class WSServer extends WebSocket.Server {
	constructor(port, processor) {
    console.log(`Server was running at ${getHost()}:${port}`);
		super({
			port: port
		});
		this.sessions = new Set();
		this.on('connection', onConn);
		if (processor) this.on('client', processor);
	}
}
const ErrorListener = new EventEmitter;
class Session extends EventEmitter {
	constructor(server, socket) {
		super();
		this.server = server;
		this.socket = socket;
		this.eventListeners = new Map();
		this.responsers = new Map();
		socket.on('message', onMessage.bind(this));
    socket.on('close', onClose.bind(this));
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
			}));
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
			}));
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
		this.socket.send(JSON.stringify(json));
		Formation.set(json.header.requestId, command);
		return json.header.requestId;
	}

	sendCommandSync(command) {
		return new Promise((done, reject) =>{
			let json = {
				header: buildHeader('commandRequest'),
				body: {
					version: 1,
					commandLine: command
				}
			};
			this.responsers.set(json.header.requestId, done);
			this.socket.send(JSON.stringify(json));
		});
	}

	sendText(text) {
		this.sendCommand('say ' + text);
	}

	tellraw(text, color) {
		this.sendCommand('tellraw @s ' + JSON.stringify({
			rawtext:[
				{
					text:color || "§e" + text
				}
			]
		}));
	}

	setBlock(x, y, z, blockId, blockData) {
		blockData = blockData || 0;
		this.sendCommand(['setblock', x, y, z, blockId, blockData].join(' '));
	}


}

module.exports = WSServer;

function onConn(socket, req) {
	var session = new Session(this, socket);
	this.sessions.add(session);
	this.emit('client', session, req);
}

function onMessage(message) {
	var json = JSON.parse(message);
	this.emit('onJSON', message);
	var header = json.header;
	switch (header.messagePurpose) {
	case 'event':
		let listeners = this.eventListeners.get(json.body.eventName);
		if (listeners) {
			listeners.forEach(function(e) {
				try {
					e(json.body, json);
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

function onClose() {
	this.server.sessions.delete(this);
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
