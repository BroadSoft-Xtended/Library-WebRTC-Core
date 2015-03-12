module.exports = CookieProp;

var Prop = require('./prop');
var C = require('./constants');
var Utils = require('./utils');
var $ = require('jquery');
require('jquery.cookie')

function CookieProp(obj, prop, databinder) {

	var self = {};

	var cookie = Utils.camelize(obj._name + ' ' + prop.name);
	var expires = C.EXPIRES;

	var _onInit = prop.onInit;
	prop.onInit = function(){
		if(!prop.value && $.cookie(cookie)) {
 			obj[prop.name] = $.cookie(cookie);
		}
		_onInit && _onInit();
		// console.log('cookie oninit : '+prop.name, obj[prop.name]);
	};

	var _onSet = prop.onSet;
	prop.onSet = function(value){
		if (value) {
			$.cookie(cookie, value, {
				expires: expires
			});
		} else {
			$.removeCookie(cookie);
		}
		_onSet && _onSet(value);
	};

	var propObj = Prop(obj, prop, databinder);

	return propObj;
}