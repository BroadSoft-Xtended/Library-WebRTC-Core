module.exports = CookieProp;

var Prop = require('./prop');
var C = require('./constants');
var Utils = require('./utils');
var $ = require('jquery');
require('jquery.cookie')

function CookieProp(obj, prop, databinder, cookie, expires) {

	var self = {};

	self.__proto__ = Prop(obj, prop, databinder);

	var superSet = self.__proto__.__set;

	var superInit = self.__proto__.__init;

	cookie = cookie || Utils.camelize(obj._name + ' ' + self._name);
	expires = expires || C.EXPIRES;

	self.__proto__.__init = function() {
		superInit();
		if(!prop.value && $.cookie(cookie)) {
 			obj[self._name] = $.cookie(cookie);
		}
 	};
	self.__proto__.__set = function(value) {
		superSet(value);
		self.__persist(value);
	};
	self.__proto__.__persist = function(value) {
		if (value) {
			// console.log('set cookie value : '+cookie, value);
			$.cookie(cookie, value, {
				expires: expires
			});
		} else {
			$.removeCookie(cookie);
		}
	}

	return self;
}