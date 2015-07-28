module.exports = require('./bdsft').Model(URLConfig, {
	config: require('../js/config')
});

var Flags = {
	enableCallControl: 1,
	enableCallTimer: 2,
	enableCallHistory: 4,
	enableFullscreen: 8,
	enableSelfView: 16,
	enableCallStats: 32,
	enableScreenshare: 64,
	enableMute: 128,
	enableMessages: 256,
	enableRegistrationStatus: 512,
	enableConnectionStatus: 1024,
	enableSettings: 2048,
	enableAutoAnswer: 4096,
	enableConnectLocalMedia: 8192,
	enableTransfer: 16384,
	enableHold: 32768,
	enableIms: 65536
};

var Utils = require('./utils');

function URLConfig() {
	var self = {};

	var contains = function(name, value) {
		var val = self.props[name];
		return val && val.indexOf(value) !== -1
	};
	var isTrue = function(name) {
		return Utils.getSearchVariable(name);
	};
	var isFeature = function(name) {
		var features = Utils.getSearchVariable('features');
		if(!features){
			return;
		}
		return (features & Flags[name]) === Flags[name];
	};
	var isTrueOrFeature = function(name) {
		var search = Utils.getSearchVariable(name);
		if(search !== undefined) {
			return search;
		}
		return isFeature(name);
	}

	self.props = {
		audioOnly: isTrue("audioOnly"),
		hd: isTrue("hd"),
		view: Utils.getSearchVariable("view") || self.view,
		maxCallLength: Utils.getSearchVariable("maxCallLength"),
		destination: Utils.getSearchVariable("destination"),
		networkUserId: Utils.getSearchVariable("networkUserId"),
		displayName: Utils.getSearchVariable("displayName"),
		size: Utils.getSearchVariable("size"),
		features: Utils.getSearchVariable("features"),
		enableCallControl: isTrueOrFeature('enableCallControl'),
		enableCallTimer: isTrueOrFeature('enableCallTimer'),
		enableCallHistory: isTrueOrFeature('enableCallHistory'),
		enableFullscreen: isTrueOrFeature('enableFullscreen'),
		enableScreenshare: isTrueOrFeature('enableScreenshare'),
		enableSelfView: isTrueOrFeature('enableSelfView'),
		enableCallStats: isTrueOrFeature('enableCallStats'),
		enableMute: isTrueOrFeature('enableMute'),
		enableMessages: isTrueOrFeature('enableMessages'),
		enableRegistrationStatus: isTrueOrFeature('enableRegistrationStatus'),
		enableConnectionStatus: isTrueOrFeature('enableConnectionStatus'),
		enableSettings: isTrueOrFeature('enableSettings'),
		enableAutoAnswer: isTrueOrFeature('enableAutoAnswer'),
		enableConnectLocalMedia: isTrueOrFeature('enableConnectLocalMedia'),
		enableTransfer: isTrueOrFeature('enableTransfer'),
		enableHold: isTrueOrFeature('enableHold'),
		enableIms: isTrueOrFeature('enableIms')
	}

	self.props.audioOnlyView = self.props.view && self.props.view.indexOf('audioOnly') !== -1;

	self.getFeatures = function() {
		var flags = 0;
		for (var flag in Flags) {
			var value = Flags[flag];
			if (self[flag]) {
				flags |= value;
			}
		}
		return flags;
	};

	self.setFeatures = function(flags) {
		for (var flag in Flags) {
			var value = Flags[flag];
			if (flags & value) {
				self[flag] = true;
			} else {
				self[flag] = false;
			}
		}
	};

	return self;
}