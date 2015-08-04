var utils = require('./utils')
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
var DataBinder = require('./databinder');
var Utils = require('./utils');
var StylesManager = require('./stylesmanager');

var databinder = function(name, constructorArgs, source) {
	var databinder;
	if (name === source._name || name === 'self') {
		if (!source.databinder) {
			throw Error('databinder : undefined on ' + source._name);
		}
		return source.databinder;
	}

	for (var i = 0; i < constructorArgs.length; i++) {
		if (constructorArgs[i]._name && (constructorArgs[i]._name === name || constructorArgs[i]._name.replace(/view$/, '') === name)) {
			if (!constructorArgs[i].databinder) {
				throw Error('databinder : undefined on ' + name);
			}
			return constructorArgs[i].databinder;
		}
	}

	// View without model
	if (name === source._name.replace(/view$/, '')) {
		return new DataBinder(name);
	}

	throw Error('databinder : ' + name + ' constructor argument missing in ' + source._name);
};
var bdsft = {
	View: View,
	Model: Model,
	databinder: databinder
};

module.exports = bdsft;

function View(constructor, options) {
	var self = {};

	self.options = options;
	self.argNames = argNamesFun(constructor);
	self.name = functionName(constructor);
	self.viewName = self.name.replace('view', '');
	self.constructor = constructor;

	self.create = function(constructorArgs, createOptions) {
		constructorArgs = constructorArgs || [];
		createOptions = createOptions || {};
		options = options || {};
		var object = createFun(constructor, constructorArgs);

		object.appendTo = function(view) {
			object.view.appendTo(view);
		};
		object.updateContentView = function(contentView, items, createItemViewCallback) {
			contentView.html("");
			for (var name in items) {
				var item = items[name];
				var view = createItemViewCallback(item);
				view.view.appendTo(contentView);
			}
		};

		object._name = self.name;
		object.databinder = databinder(self.viewName, constructorArgs, object);
		var view = createOptions.template && createOptions.template[self.viewName] && createOptions.template[self.viewName]() || options.template && options.template[self.viewName] && options.template[self.viewName]() || object.template || require(self.viewName + '-bdsft-webrtc-templates')[self.viewName] && require(self.viewName + '-bdsft-webrtc-templates')[self.viewName]();
		if (!view) {
			console.error('no view template found : ' + self.viewName);
			return;
		}
		object.view = require('jquery')(view);
		(object.elements || []).forEach(function(element) {
			require('./app').element(object, element, object.databinder);
		});
		bindings(object, constructorArgs);
		call(object, 'listeners', options, constructorArgs);
		call(object, 'init', options, constructorArgs);

		StylesManager.inject(self.viewName, createOptions, options);

		var classesHolder = object.view.find('.classes:first');
		if (classesHolder.length === 0) {
			classesHolder = object.view;
		}
		var classes = classesHolder.attr('class');
		object.databinder.onModelPropChange('classes', function(value) {
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
		object.databinder = new DataBinder(self.name);
		var medias = utils.extend({},
			options.media,
			options.media && options.media['media'],
			options.media && options.media[self.name],
			createOptions.media && createOptions.media[self.name]
		);
		if (Object.keys(medias).length) {
			object.medias = medias;
		}
		var createConfig = createOptions.config && createOptions.config[self.name] || createOptions[self.name];
		var config = options.config && options.config[self.name] || options.config;
		if (config || createConfig) {
			var config = utils.extend({}, config, createConfig);
			for (var name in config) {
				require('./app')['prop'](object, {
					name: name,
					value: config[name]
				}, object.databinder);
			}
			if (!object.updateConfig) {
				object.updateConfig = function(config) {
					config = config || {};
					for (var name in config) {
						if (typeof object[name] !== 'undefined') {
							object[name] = config[name];
						}
					}
				};
			}
			if (!object.configChanges) {
				object.configChanges = function() {
					var changes = {};
					for (var name in config) {
						if (object[name] !== config[name]) {
							changes[name] = object[name];
						}
					}
					return changes;
				};
			}
		}
		(Array.isArray(object.props) && object.props || object.props && Object.keys(object.props) || []).forEach(function(name) {
			var value = object.props[name];
			var prop = utils.extend({
				name: name
			}, typeof value !== 'object' && {
				value: value
			} || value)
			var type = prop.type || object._propstype || object.props._type || '';
			if (type === 'default') {
				type = '';
			}
			if (name === 'visible') {
				type = 'visible';
			}
			require('./app')[type + 'prop'](object, prop, object.databinder);
		});
		bindings(object, constructorArgs);
		call(object, 'listeners', options, constructorArgs);
		call(object, 'init', options, constructorArgs);
		return object;
	};

	self.argNames = argNamesFun(constructor);
	self.name = functionName(constructor);
	self.options = options;
	self.constructor = constructor;

	return self;
};

function bindings(object, constructorArgs) {
	(object.bindings && Object.keys(object.bindings) || []).forEach(function(name) {
		var from = object.bindings[name];
		var binding;
		if (name === 'classes') {
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

function call(object, method, options, constructorArgs) {
	if (!object[method]) {
		return;
	}
	var argNames = argNamesFun(object[method]);
	var args = [];
	for (var i = 0; i < argNames.length; i++) {
		if (argNames[i].match(/databinder/i)) {
			var databinderArg = databinder(argNames[i].replace(/databinder/i, '') || object._name, constructorArgs, object);
			args.push(databinderArg);
		} else if (argNames[i] === 'options') {
			args.push(options);
		} else {
			// console.warn('no arg on '+ name +' found for : '+argNames[i]);
		}
	}
	return createFun(object[method], args);
}

function createFun(constructor, argArray) {
	var args = [null].concat(argArray);
	var factoryFunction = constructor.bind.apply(constructor, args);
	return new factoryFunction();
}