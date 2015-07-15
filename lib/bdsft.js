var utils = require('./utils')
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
var DataBinder = require('./databinder');
var Utils = require('./utils');
var stylesCore = require('../js/styles').core;
var cssCore = require('./css')({viewName: 'core'});

var databinder = function(name) {
	var databinder = bdsft.databinders[name];
	if(!databinder) {
		databinder = new DataBinder(name);
		bdsft.databinders[name] = databinder;
	}
	return databinder;
};
var bdsft = {
	View: View,
	Model: Model,
	databinders: {},
	databinder: databinder
};

module.exports = bdsft;

function View(constructor, options) {
	var self = {};

	self.options = options;
	self.argNames = argNamesFun(constructor);
	self.name = functionName(constructor);
	self.viewName = self.name.replace('view', '');
	var css = require('./css')(self);

	self.create = function(constructorArgs, createOptions) {
		constructorArgs = constructorArgs || [];
		createOptions = createOptions || {};
		options = options || {};
		var object = createFun(constructor, constructorArgs);
		object._name = self.name;
		var view = createOptions.template && createOptions.template[self.viewName] && createOptions.template[self.viewName]()
		|| options.template && options.template[self.viewName] && options.template[self.viewName]() 
		|| object.template 
		|| require(self.viewName+'-bdsft-webrtc-templates')[self.viewName] && require(self.viewName+'-bdsft-webrtc-templates')[self.viewName]();
		if(!view) {
			console.error('no view template found : '+self.viewName);
			return;
		}
		object.view = require('jquery')(view);
		(object.elements || []).forEach(function(element) {
			require('./app').element(object, element, databinder(self.viewName));
		});
		bindings(object, constructorArgs);
		call(object.listeners, options, self.viewName);
		call(object.init, options, self.viewName);

		cssCore.inject(createOptions.styleData, {style: stylesCore})
		var style = createOptions.style && createOptions.style[self.viewName] 
		|| options.style && options.style[self.viewName]
		|| options.style && options.style['styles']
		|| options.style;
		if(style) {
			var styleData = Utils.extend({}, createOptions.styleData);
			var images = utils.extend({}, 
				options.image,
				options.image && options.image['images'],
				options.image && options.image[self.viewName],
				createOptions.image && createOptions.image[self.viewName]
			);
			if(Object.keys(images).length) {
				styleData = Utils.extend(styleData, images);
			}
			css.inject(styleData, {constants: options.constants, style: style});
			if(!object.updateStyle) {
				object.updateStyle = function(styles){
					// only update if view contains constants.STYLES and styles keys
					if(options.constants && options.constants.STYLES && Utils.contains(options.constants.STYLES, styles)) {
						css.update(Utils.extend({}, styleData, styles), {constants: options.constants, style: style});
					}
				};
			}
			if(!object.styleChanges) {
				object.styleChanges = function(){
					var changes = {};
					if(options.constants && options.constants.STYLES) {
						for(var name in options.constants.STYLES) {
							var value = options.constants.STYLES[name];
							if(css.data && css.data[name] !== value) {
								changes[name] = css.data[name];
							}
						}
					}
					return changes;
				};
			}
		}

		var classesHolder = object.view.find('.classes:first');
		if(classesHolder.length === 0) {
			classesHolder = object.view;
		}
		var classes = classesHolder.attr('class');
		databinder(self.viewName).onModelPropChange('classes', function(value){
			classesHolder.attr('class', classes + ' ' + value.join(' '));
		});
		return object;
	};

	return self;
}

function Model(constructor, options) {
	var self = {};

	self.create = function(constructorArgs, createOptions) {
		constructorArgs = constructorArgs || [];
		createOptions = createOptions || {};
		options = options || {};
		var object = createFun(constructor, constructorArgs);
		object._name = self.name;
		var medias = utils.extend({}, 
			options.media,
			options.media && options.media['media'],
			options.media && options.media[self.name],
			createOptions.media && createOptions.media[self.name]
		);
		if(Object.keys(medias).length) {
			object.medias = medias;
		}
		var createConfig = createOptions.config && createOptions.config[self.name] || createOptions[self.name];
		var config = options.config && options.config[self.name]
			|| options.config;
		if(config || createConfig) {
			var config = utils.extend({}, config, createConfig);
			for(var name in config) {
				require('./app')['prop'](object, {name: name, value: config[name]}, databinder(self.name));
			}
			if(!object.updateConfig) {
				object.updateConfig = function(config){
					config = config || {};
					for(var name in config) {
						if(object[name]) {
							object[name] = config[name];
						}
					}
				};
			}
			if(!object.configChanges) {
				object.configChanges = function(){
					var changes = {};
					for(var name in config) {
						if(object[name] !== config[name]) {
							changes[name] = object[name];
						}
					}
					return changes;
				};
			}
		}
		(Array.isArray(object.props) && object.props || object.props && Object.keys(object.props) || []).forEach(function(name) {
			var value = object.props[name];
			var prop = utils.extend({name: name}, typeof value !== 'object' && {value: value} || value)
			var type = prop.type || object._propstype || object.props._type || '';
			if(type === 'default') {
				type = '';
			}
			if(name === 'visible') {
				type = 'visible';
			}
			require('./app')[type+'prop'](object, prop, databinder(self.name));
		});
		bindings(object, constructorArgs);
		call(object.listeners, options, self.name);
		call(object.init, options, self.name);
		return object;
	};

	self.argNames = argNamesFun(constructor);
	self.name = functionName(constructor);
	self.options = options;

	return self;
};

function bindings(object, constructorArgs){
	(object.bindings && Object.keys(object.bindings) || []).forEach(function(name) {
		var from = object.bindings[name];
		var binding;
		if(name === 'classes') {
			binding = require('./classesbinding')(object, name, from, constructorArgs);
		} else {
			binding = require('./binding')(object, name, from, constructorArgs);
		}
		binding.init();
	});
}

function functionName(fun) {
		var ret = fun.toString();
		ret = ret.substr('function '.length);
		ret = ret.substr(0, ret.indexOf('('));
		return ret.toLowerCase();
}

function argNamesFun(fun) {
		var fnStr = fun.toString().replace(STRIP_COMMENTS, '')
		var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
		if (result === null) {
			result = [];
		}
		return result;
}

function call(method, options, name) {
	if(!method) {
		return;
	}
	var argNames = argNamesFun(method);
	var args = [];
	for(var i=0; i < argNames.length; i++) {
		if(argNames[i].match(/databinder/i)) {
			var databinderArg = databinder(argNames[i].replace(/databinder/i, '') || name);
			args.push(databinderArg);
		} 
		else if(argNames[i] === 'options') {
			args.push(options);
		}
		else {
			// console.warn('no arg on '+ name +' found for : '+argNames[i]);
		}
	}
	return createFun(method, args);
}

function createFun(constructor, argArray) {
	var args = [null].concat(argArray);
	var factoryFunction = constructor.bind.apply(constructor, args);
	return new factoryFunction();
}