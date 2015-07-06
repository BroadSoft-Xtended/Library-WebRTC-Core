module.exports = require('./bdsft').Model(CookieConfig);

var jQuery = $ = require('jquery');
require('jquery.cookie');

function CookieConfig() {
	var self = {};
	var prefix = 'bdsft_';

	self.get = function(name) {
		return $.cookie(prefix + name);
	};
	self.set = function(name, value) {
		return $.cookie(prefix + name, value);
	};

	self._propstype = 'cookie';

	self.props = ['authenticationUserid', 'userid', 'password', 'encodingResolution', 'displayResolution', 'hd', 'displayName', 'enableSelfView', 
		'bandwidthLow', 'bandwidthMed', 'bandwidthHigh', 'enableAutoAnswer'];

	return self;
}