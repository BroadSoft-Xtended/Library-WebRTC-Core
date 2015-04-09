var utils = require('./utils')
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
var DataBinder = require('./databinder');
var Utils = require('./utils');
var css = require('./css');
var styles = require('../js/styles');
var bdsft = {
	View: View,
	Model: Model,
	databinders: {}
};

module.exports = bdsft;

function View(constructor, options) {
	var self = {};

	self.argNames = argNamesFun(constructor);
	self.name = functionName(constructor);
	self.viewName = self.name.replace('view', '');

	self.create = function(constructorArgs, createOptions) {
		constructorArgs = constructorArgs || [];
		createOptions = createOptions || {};
		options = options || {};
		var object = createFun(constructor, constructorArgs);
		object._name = self.name;
		var view = options.template && options.template[self.viewName] && options.template[self.viewName]() 
		|| object.template 
		|| require(self.viewName+'-bdsft-webrtc-templates')[self.viewName] && require(self.viewName+'-bdsft-webrtc-templates')[self.viewName]();
		if(!view) {
			console.error('no view template found : '+self.viewName);
			return;
		}
		object.view = require('jquery')(view);
		(object.elements || []).forEach(function(element) {
			require('webrtc-core').element(object, element, databinder(self.viewName));
		});
		call(object.listeners, options, self.viewName);
		call(object.init, options, self.viewName);

		css.inject('core', createOptions, {style: styles});
		css.inject(self.viewName, createOptions, options);
		object.styleData = createOptions.styleData;

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
		call(object.listeners, options, self.name);
		call(object.init, options, self.name);
		return object;
	};

	self.argNames = argNamesFun(constructor);
	self.name = functionName(constructor);

	return self;
};

function databinder(name) {
	var databinder = bdsft.databinders[name];
	if(!databinder) {
		databinder = new DataBinder(name);
		bdsft.databinders[name] = databinder;
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