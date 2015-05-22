module.exports = Binding;
var bdsft = require('./bdsft');
var utils = require('./utils');

function Binding(object, toProp, from, constructorArgs) {
	var self = {};

	self.fromObject = function(fromModel) {
		var fromModelObj;
		if (object._name === fromModel) {
			fromModelObj = object;
		} else {
			fromModelObj = constructorArgs.filter(function(arg) {
				return arg._name === fromModel;
			}).pop();
		}

		return fromModelObj;
	};

	self.init = function init() {
		var fromKeys = Object.keys(from);
		var updateHandle = utils.camelize('update ' + toProp);
		if (!object.hasOwnProperty(updateHandle) && typeof object[updateHandle] !== 'function') {
			// add update method for single binding if not defined
			if(fromKeys.length === 1 && !Array.isArray(from[fromKeys[0]])) {
				if(!object.hasOwnProperty(toProp)) {
					throw Error(toProp + ' does not exist in ' + (object._name || object));
				}
				object[updateHandle] = function(value){
					object[toProp] = value;
				};
			} else {
				throw Error(updateHandle + ' does not exist in ' + (object._name || object));
			}
		}

		fromKeys.forEach(function(fromModel) {
			var databinder = bdsft.databinder(fromModel);
			var fromProp = from[fromModel];
			var fromObj = self.fromObject(fromModel);
			if(fromObj) {
				if (Array.isArray(fromProp)) {
					fromProp.forEach(function(p) {
						if (!fromObj.hasOwnProperty(p)) {
							throw Error(p + ' does not exist in ' + fromModel);
						}
					})
				} else if (!fromObj.hasOwnProperty(fromProp)) {
					throw Error(fromProp + ' does not exist in ' + fromModel);
				}
			}

			databinder.onModelPropChange(fromProp, function(value) {
				if (typeof object[updateHandle] === 'function') {
					object[updateHandle](value);
				} else {
					object[updateHandle] = value;
				}
			});
		});

		object[updateHandle]();
	};

	return self;
}