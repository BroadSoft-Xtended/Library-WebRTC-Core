module.exports = CookieProp;

var Prop = require('./prop');
var C = require('./constants');
var Utils = require('./utils');
var $ = require('jquery');
require('jquery.cookie')

function CookieProp(obj, prop, databinder) {

	var self = {};

	var cookie = 'bdsft_'+ obj._name + '_' + prop.name;
	var expires = C.EXPIRES;

	var _onInit = prop.onInit;
	prop.onInit = function(){
		if(!prop.value && $.cookie(cookie)) {
			var value = $.cookie(cookie);
			if(value === 'true') {
 				obj[prop.name] = true;
			} else if(value === 'false') {
 				obj[prop.name] = false;
			} else {
 				obj[prop.name] = value;
			}
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