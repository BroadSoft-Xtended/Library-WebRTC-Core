module.exports = Prop;

function Prop(obj, prop, databinder) {
	var self = {};

	var _name = prop.name || prop;
	var internal;

	var __get = function(){
		return internal;
	};
	var __init = function(){
		if(prop.value && prop.value()) {
			obj[_name] = prop.value();
		}
	};
	var __set = function(value){
		internal = value;
		databinder.modelChanged(_name, value);
		if(prop.onSet) {
			prop.onSet(value);
		}
	};

	databinder.onViewChange(function(name, value){
		if(name === _name) {
			internal = value;
		}
	});

	Object.defineProperty(obj, _name, {
		writeable: false,
		configurable: true,
		get: prop.get || __get,
		set: prop.set || __set
	});	

	__init();

	return self;
}