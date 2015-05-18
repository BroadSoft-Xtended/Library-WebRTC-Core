module.exports = VisibleProp;

var Prop = require('./prop');
var C = require('./constants');
var Utils = require('./utils');

function VisibleProp(obj, prop, databinder) {

	var self = {};

	if(!obj.toggle) {
		obj.toggle = function(){
			obj.visible = !obj.visible;
		};
	}
	if(!obj.show) {
		obj.show = function(){
			obj.visible = true;
		};
	}
	if(!obj.hide) {
		obj.hide = function(){
			obj.visible = false;
		};
	}
	var propObj = Prop(obj, prop, databinder);

	return propObj;
}