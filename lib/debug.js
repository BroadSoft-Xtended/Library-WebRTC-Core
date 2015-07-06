module.exports = require('./bdsft').Model(Debug, {
	config: require('../js/config')
})

var stacktrace = require('stacktrace-js');
var utils = require('./utils');
var debug = require('debug');
var enabled = {};
var levels = {
	debug: 0,
	log: 1,
	info: 2,
	warn: 3,
	error: 4
};
function Debug(options) {
	var self = {};
	options = options || {};
	var id = options && options.id || options || '';

	var prefix = (options.name || caller()) + ':' + id;
	var debugObj = debug(prefix);

	self.init = function(){
		var logPrefix = self.names;
		if(logPrefix+'' === 'true') {
			logPrefix = '*'
		}

		if (logPrefix) {
			enabled[id] = utils.withArray(logPrefix).map(function(a){
				return a + ':' + id;
			});
		} else {
			delete enabled[id];
		}
		updateEnabled();
	};

	var printMsg = function(level, msg) {
		if(self.level && levels[level] >= levels[self.level]) {
			debugObj.log = console[level].bind(console);
			self.print(msg);
		}
	}
	self.print = function(msg) {
		debugObj(msg);
	};
	self.log = function(msg){
		printMsg('log', msg);
	};
	self.warn = function(msg){
		printMsg('warn', msg);
	};
	self.error = function(msg){
		printMsg('error', msg);
	};
	self.debug = function(msg){
		printMsg('debug', msg);
	};
	self.info = function(msg){
		printMsg('info', msg);
	};

	return self;
}

var caller = function(){
	var list = stacktrace();
	for(var i=list.length-1; i >= 0; i--) {
		var match = null;
		if((match = list[i].match(/([A-Z]\S*).*@/g))) {
			if(match !== 'Object') {
				return match;				
			}
		}
	}

	return stacktrace().pop().match('(.*)@').pop();
}
var updateEnabled = function() {
	var values = [];
	Object.keys(enabled).forEach(function(key) {
		if(Array.isArray(enabled[key])) {
			values = values.concat(enabled[key]);
		} else {
			values.push(enabled[key]);
		}
	});
	debug.enable(values.join(','));
};
// exports.enable = function(id){
// 	enabledList.push('*'+id);
// 	var enabledStr = enabledList.join(',');
// 	debug.enable(enabledStr);
// };
// exports.disable = function(){
// 	enabledList = [];
// 	debug.disable();
// };
// exports.log = debug.log;