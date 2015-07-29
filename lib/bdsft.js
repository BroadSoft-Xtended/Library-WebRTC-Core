var utils = require('./utils')
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
var DataBinder = require('./databinder');
var Utils = require('./utils');
var StylesManager = require('./stylesmanager');

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

		StylesManager.inject(self.viewName, createOptions, options);

		var classesHolder = object.view.find('.classes:first');
		if(classesHolder.length === 0) {
			classesHolder = object.view;
		}
		var classes = classesHolder.attr('class');
		databinder(self.viewName).onModelPropChange('classes', function(value){
			classesHolder.attr('class', classes + ' ' + value.join(' '));
		});
		object.databinder = databinder(self.viewName);
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
						if(typeof object[name] !== 'undefined') {
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
		object.databinder = databinder(self.name);
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