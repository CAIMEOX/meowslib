const WSServer = require('./src/mcpews');
const BuildSession = require('./src/session');

var wss = new WSServer(19134);

wss.on('client', function(session, request) {
	BuildSession.createAndBind(session);
	console.log(request.connection.remoteAddress + ' connected!');
});

console.log('Server started on port 19134!');