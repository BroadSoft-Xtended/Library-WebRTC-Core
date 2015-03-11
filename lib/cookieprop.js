module.exports = CookieProp;

var Prop = require('./prop');
var C = require('./constants');
var Utils = require('./utils');
var $ = require('jquery');
require('jquery.cookie')

function CookieProp(obj, prop, databinder) {

	var self = {};

	prop.onInit = function(){
		if(!prop.value && $.cookie(cookie)) {
 			obj[self._name] = $.cookie(cookie);
		}
	};

	prop.onSet = function(value){
		if (value) {
			console.log('set cookie value : '+cookie, value);
			$.cookie(cookie, value, {
				expires: expires
			});
		} else {
			$.removeCookie(cookie);
		}
	};

	var propObj = Prop(obj, prop, databinder);

	var cookie = cookie || Utils.camelize(obj._name + ' ' + propObj._name);
	var expires = expires || C.EXPIRES;


	return propObj;
}