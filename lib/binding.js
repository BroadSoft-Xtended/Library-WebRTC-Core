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

		fromKeys.forEach(function(fromModel) {
			var databinder = bdsft.databinder(fromModel);
			var fromProp = from[fromModel];
			var fromObj = self.fromObject(fromModel);
			if(fromObj) {
				if (Array.isArray(fromProp)) {
					fromProp.forEach(function(p) {
						if (!fromObj.hasOwnProperty(p)) {
							throw Error('binding error : '+p + ' does not exist in ' + fromModel);
						}
					})
				} else if (!fromObj.hasOwnProperty(fromProp)) {
					throw Error('binding error : '+fromProp + ' does not exist in ' + fromModel);
				}
			}

			databinder.onModelPropChange(fromProp, function(value) {
				var updateHandle = utils.camelize('update ' + toProp);
				if (typeof object[updateHandle] === 'function') {
					object[updateHandle](value);
				} else if (object.hasOwnProperty(updateHandle)) {
					object[updateHandle] = value;
				} else {
					if(!object.hasOwnProperty(toProp)) {
						throw Error('binding error : prop '+toProp + ' does not exist in ' + (object._name || object));
					}
					object[toProp] = value;
				}
			});
		});
	};

	return self;
}