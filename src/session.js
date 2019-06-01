const Constants = require('./constants');
const Parser = require('./parser');
class BuildSession {
	static createAndBind (session) {
		let r = new BuildSession();
		r.session = session;
		r.init();
		return r;
	}

	init () {
		this.session.subscribe('PlayerMessage', onPlayerMessage.bind(this));
	}

	onChatMessage (msg, player) {
		this.session.emit('onMessage',msg, player);
		this.session.emit('onCommand',new Parser(msg));
	}
}

let Sleep = false;
function onPlayerMessage(body) {
	if(Sleep)return;
	Sleep = true;
	let $Sleep = setInterval(() => {
		Sleep = false;
	},5);
	this.session.emit('onJSON', body);
	var pp = body.properties;
	if (pp.MessageType != 'chat') return;
	this.onChatMessage(pp.Message, pp.Sender);
}

module.exports = BuildSession;
