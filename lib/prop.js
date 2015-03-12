module.exports = Prop;

function Prop(obj, prop, databinder) {
	var self = {};

	var _name = self._name = prop.name || prop;
	var internal;

	var __get = function(){
		return internal;
	};
	var __init = function(){
		if(prop.value && prop.value()) {
			obj[_name] = prop.value();
		}
		prop.onInit && prop.onInit();
	};
	var __set = function(value){
		internal = value;
		databinder.modelChanged(_name, value);
		prop.onSet && prop.onSet(value);
	};

	databinder.onViewElChange(_name, function(value){
		internal = value;
		prop.onSet && prop.onSet(value);
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