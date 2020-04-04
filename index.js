const WSServer = require('./src/mcpews');
const BuildSession = require('./src/session');
const Commander = require('./src/commander');
const Parser = require('./src/parser');
const Collector = require('./src/collector');
const Builder = require('./src/builder');
const StringIds = require('./res/blockId');
const BlockType = require('./res/blocktype');
const ColorTable = require('./res/colortable');
const Pako = require('./res/pako');
const ProgressBar = require('./src/progressbar')
const Palette = require('./res/palette');
// const Lang = require('./res/lang');
const Logger = require('./src/logger.js');
const Res = {
	StringIds,ColorTable,Pako,Palette,BlockType
}
module.exports = {
	Res,
	WSServer,
	BuildSession,
	ProgressBar,
	Commander,
	Parser,
	Collector,
	Builder,
	Logger
}
