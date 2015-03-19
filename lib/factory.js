var $ = require('jquery');
var Utils = require('./utils');
module.exports = Factory;

function Factory(options) {
	options.dependencies = options.dependencies || {};

	function getId(name) {
		var id;
		if (typeof options === "object") {
			id = options.id;
		}
		id = id || 'default';

		id = name + '_' + id;
		return id;
	};

	function requireArg(argName) {
		var arg = options.dependencies[argName] || options.dependencies.core[argName];
		if(!arg && argName.match(/view/i)) {
			arg = options.dependencies[argName.replace(/view/i, '')];
			return arg.view;
		}

		if(!arg) {
			var keys = Object.keys(options.dependencies);
			for(var i=0; i < keys.length; i++){
				var dependency = options.dependencies[keys[i]][argName];
				if(dependency) {
					return dependency;
				}
			}
		}

		if(!arg) {
			console.error('could not find dependency for '+argName, options.dependencies);
			return;
		}

		return arg.model || arg;
	}

	function args(constructor) {
		return (constructor.argNames || []).map(function(argName) {
			if (argName === 'options') {
				return options;
			}

			var argConstructor = requireArg(argName);
			if (argName === 'debug') {
				return argConstructor.create([Utils.extend({}, options, {
					name: constructor.name
				})]);
			}
			// console.log('arg : '+argName);
			var arg = create(argConstructor);
			return arg;
		});
	};

	function create(constructor) {
		var prefix = options.instancesObj || 'bdsft';
		global[prefix] = global[prefix] || {};
		var name = constructor.name;
		var id = getId(name);
		if (!global[prefix][id]) {
			// console.log('factory : ' + id);
			var constructorArgs = args(constructor);
			// console.log('factory : create ' + id + ' with ', constructor.argNames);
			var object = constructor.create(constructorArgs);
			global[prefix][id] = object;
		}
		return global[prefix][id];
	}

	return create;
}
