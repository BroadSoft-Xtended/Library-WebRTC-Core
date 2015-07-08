var ejs = require('ejs');
var utils = require('./utils');
var constants = require('./constants');

var inject = function(name, styleData, options) {
	var cssData = utils.extend({}, options.constants && options.constants.STYLES || constants.STYLES, styleData);
	var styles = options.style;
	if(!styles) {
		return;
	}
	var cssStr = ejs.render(styles, cssData);
	var id = 'bdsft_css_'+name;
	var cssEl = utils.getElement('#'+id);
	if (!cssEl || cssEl.length === 0) {
		utils.createElement('<style>', {
			id: id,
			type: 'text/css',
			text: cssStr
		}, {
			parent: 'head'
		});
	}
};

module.exports = {inject: inject};