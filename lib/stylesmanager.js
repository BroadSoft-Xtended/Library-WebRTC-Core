var utils = require('./utils');
var constants = require('./constants');
var cssCore = require('./css')('core');
var stylesCore = require('../js/styles').core;

function Styl(viewName, createOptions, viewOptions) {
	var self = {};

	var module = viewOptions.module || createOptions.module;
	var name = (module && module + '_' || '') + viewName;
	var css = require('./css')(name);

	var style = function(){
		return createOptions.style && createOptions.style[viewName] 
		|| viewOptions.style && viewOptions.style[viewName]
		|| viewOptions.style && viewOptions.style['styles']
		|| viewOptions.style;
	};

	var data = function(){
		var styleData = utils.extend({}, createOptions.styleData);
		var images = utils.extend({}, 
			viewOptions.image,
			viewOptions.image && viewOptions.image['images'],
			viewOptions.image && viewOptions.image[viewName],
			createOptions.image && createOptions.image[viewName]
		);
		if(Object.keys(images).length) {
			styleData = utils.extend(styleData, images);
		}
		return styleData;
	};

	self.update = function(styles){
		// only update if view contains constants.STYLES and styles keys
		if(viewOptions.constants && viewOptions.constants.STYLES && utils.contains(viewOptions.constants.STYLES, styles)) {
			css.update(utils.extend(data(), styles), {constants: viewOptions.constants, style: style()});
		}
	};

	self.changes = function(){
		var changes = {};
		if(viewOptions.constants && viewOptions.constants.STYLES) {
			for(var name in viewOptions.constants.STYLES) {
				var value = viewOptions.constants.STYLES[name];
				if(css.data && css.data[name] !== value) {
					changes[name] = css.data[name];
				}
			}
		}
		return changes;
	};

	self.inject = function(){
		if(style()) {
			css.inject(data(), {constants: viewOptions.constants, style: style()});
		}
	}

	return self;
};

function StylesManager(){
	var self = {};

	self.styles = {};

	self.changes = function() {
		var changes = {};
        for(var name in self.styles) {
          var style = self.styles[name];
          style = style[name] || style;
          changes = utils.extend(changes, style.changes());
        }
        return changes;
	};

	self.update = function(styles) {
        for(var name in styles) {
          var style = self.styles[name];
          style = style[name] || style;
          style.update(styles && styles[name] || styles);
        }
	};

	self.inject = function(viewName, createOptions, viewOptions){
		if(!self.styles['core']) {
			var style = Styl('core', createOptions, {style: stylesCore, constants: constants, module: 'core'});
			style.inject();
			self.styles['core'] = style;
		}

		var module = viewOptions.module || createOptions.module;
		var moduleStyles;
		if(module) {
			self.styles[module] = self.styles[module] || {};
			moduleStyles = self.styles[module];
		} else {
			moduleStyles = self.styles;
		}

		if(!moduleStyles[viewName]) {
			var style = Styl(viewName, createOptions, viewOptions);
			style.inject();
			moduleStyles[viewName] = style;
		}
	}

	return self;
};

module.exports = StylesManager();