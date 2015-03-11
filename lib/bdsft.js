var utils = require('./utils')
module.exports = {
	View: View,
	Model: Model
}
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
var DataBinder = require('./databinder');
var Utils = require('./utils');

var databinders = {};

function View(constructor, options) {
	var self = {};

	self.argNames = argNamesFun(constructor);
	self.name = functionName(constructor);
	self.viewName = self.name.replace('view', '');

	self.create = function(constructorArgs) {
		constructorArgs = constructorArgs || [];
		options = options || {};
		var object = createFun(constructor, constructorArgs);
		object._name = self.name;
		var view = options.view || object.template || require('bdsft-webrtc-templates')[self.viewName] && require('bdsft-webrtc-templates')[self.viewName]();
		var $ ;
		try {
			object.view = view && require('jquery')(view);
		} catch(e) {
			object.view = view && require('jquery')(window)(view);
		}
		(object.elements || []).forEach(function(element) {
			require('webrtc-core').element(object, element, databinder(self.viewName));
		});
		object.listeners && object.listeners(databinder(self.viewName));
		object.init && object.init(options);
		return object;
	};

	return self;
}

function Model(constructor, options) {
	var self = {};

	self.create = function(constructorArgs) {
		constructorArgs = constructorArgs || [];
		options = options || {};
		var object = createFun(constructor, constructorArgs);
		object._name = self.name;
		(object.props && Object.keys(object.props) || []).forEach(function(name) {
			var prop = utils.extend({name: name}, object.props[name])
			var type = prop.type || object.props._type || '';
			require('webrtc-core')[type+'prop'](object, prop, databinder(self.name));
		});
		object.listeners && object.listeners(databinder(self.name));
		object.init && object.init(options);
		return object;
	};

	self.argNames = argNamesFun(constructor);
	self.name = functionName(constructor);

	return self;
};

function databinder(name) {
	var databinder = databinders[name];
	if(!databinder) {
		databinder = new DataBinder(name);
		databinders[name] = databinder;
	}
	return databinder;
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

function createFun(constructor, argArray) {
	var args = [null].concat(argArray);
	var factoryFunction = constructor.bind.apply(constructor, args);
	return new factoryFunction();
}