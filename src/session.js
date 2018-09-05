const Constants = require('./constants');

class BuildSession {
	static createAndBind (session) {
		var r = new BuildSession();
		r.session = session;
		r.init();
		return r;
	}

	init () {
		this.sendText('FastBuild v ' + Constants.VERSION);
		this.sendText('You can input "*help" in chat screen to get all available commands.');
		this.session.subscribe('PlayerMessage', onPlayerMessage.bind(this));
	}

	onChatMessage (msg, player) {
		this.sendText('FB:[' + player + ']' + msg);
		if (msg == '*exit') this.session.sendCommand('/closewebsocket');
	}

	sendText (text) {
		this.session.sendCommand('/say ' + text);
	}

	setBlock (x, y, z, blockId, blockData) {
		blockData = blockData || 0;
		this.session.sendCommand([
			'/setblock',
			x,
			y,
			z,
			blockId,
			blockData
		].join(' '));
	}
}

function onPlayerMessage(body) {
	var pp = body.properties;
	if (pp.MessageType != 'chat') return;
	this.onChatMessage(pp.Message, pp.Sender);
}

module.exports = BuildSession;