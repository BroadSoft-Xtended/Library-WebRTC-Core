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

		if(!fromModelObj) {
			throw Error(fromModel + ' does not exist in constructor of ' + object._name);
		}
		return fromModelObj;
	};

	self.init = function init() {
		var updateHandle = utils.camelize('update ' + toProp);
		if (!object.hasOwnProperty(updateHandle) && typeof object[updateHandle] !== 'function') {
			throw Error(updateHandle + ' does not exist in ' + (object._name || object));
		}

		Object.keys(from).forEach(function(fromModel) {
			var databinder = bdsft.databinder(fromModel);
			var fromProp = from[fromModel];
			var fromObj = self.fromObject(fromModel);
			if (Array.isArray(fromProp)) {
				fromProp.forEach(function(p) {
					if (!fromObj.hasOwnProperty(p)) {
						throw Error(p + ' does not exist in ' + fromModel);
					}
				})
			} else if (!fromObj.hasOwnProperty(fromProp)) {
				throw Error(fromProp + ' does not exist in ' + fromModel);
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