module.exports = ClassesBinding;

function ClassesBinding(object, toProp, from, constructorArgs) {
	var self = require('./binding')(object, toProp, from, constructorArgs);

	var value = function(fromObj, fromProp) {
		var val = fromObj[fromProp];
		if(typeof val === 'function') {
			val = val();
		}

		if (Array.isArray(val)) {
			return val;
		} else if (typeof val === 'string') {
			return val;
		} else if (typeof val === 'boolean' && fromProp.match(/visible/i)) {
			var prefix = fromProp.replace(/visible/i, '') || fromObj._name;
			return val ? prefix + '-shown' : prefix + '-hidden';
		} else {
			if (val) {
				return fromProp;
			}
		}
		return;
	};

	object.updateClasses = function() {
		var classes = [];
		Object.keys(from).forEach(function(fromModel) {
			var fromProp = from[fromModel];
			var fromObj = self.fromObject(fromModel);
			if(!fromObj) {
				throw Error('classes binding error : '+fromModel + ' does not exist in constructor of ' + object._name);
			}

			(Array.isArray(fromProp) && fromProp || [fromProp]).forEach(function(prop) {
				var val = value(fromObj, prop);
				if(!val) {
					return;
				} else if (Array.isArray(val)) {
					classes = classes.concat(val);
				} else {
					classes.push(val)
				}
			});
		});
		// prepend classes that start with a number with _
		classes = classes.map(function(clazz){
			return clazz.match(/^\d/) && '_' + clazz || clazz
		});
		// replace empty space with - and lower case 
		classes = classes.map(function(clazz){
			return clazz.trim().replace(/\s/, '-');
		});
		object[toProp] = classes;
	};

	return self;
}