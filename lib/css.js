module.exports = CSS;

var ejs = require('ejs');
var utils = require('./utils');
var constants = require('./constants');

function CSS(name) {
	var self = {};

	var id = 'bdsft_css_'+name;

	var cssData = function(styleData, options){
		return utils.extend({}, options.constants && options.constants.STYLES || constants.STYLES, styleData);
	};

	var cssStr = function(styleData, options){
		var styles = options.style;
		if(!styles) {
			return;
		}
		return ejs.render(styles, cssData(styleData, options));
	};

	self.inject = function(styleData, options) {
		var css = cssStr(styleData, options);
		if(!css) {
			return;
		}
		var cssEl = utils.getElement('#'+id);
		if (!cssEl || cssEl.length === 0) {
			self.data = cssData(styleData, options);
			utils.createElement('<style>', {
				id: id,
				type: 'text/css',
				text: css
			}, {
				parent: 'head'
			});
		}
	};

	self.update = function(styleData, options) {
		var css = cssStr(styleData, options);
		if(!css) {
			return;
		}
		var cssEl = utils.getElement('#'+id);
		if (cssEl && cssEl.length > 0) {
			self.data = cssData(styleData, options);
			cssEl.text(css)
		}
	};

	return self;
}