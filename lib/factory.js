var $ = require('jquery');
var Utils = require('./utils');
module.exports = Factory;

function Factory(options) {
	options.dependencies = options.dependencies || {};

	function getId() {
		var id;
		if (typeof options === "object") {
			id = options.id;
		}
		return id || 'default';
	};

	function requireArg(argName, constructor) {
		var arg = options.dependencies[argName] || options.dependencies.core[argName];
		if(!arg && argName.match(/view/i)) {
			arg = options.dependencies[argName.replace(/view/i, '')];
			if(!arg) {
				throw Error('factory error : could not find dependency for '+argName + ' required by '+constructor.name + ' - dependencies : ', Object.keys(options.dependencies));
			}
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
			throw Error('factory error : could not find dependency for '+argName + ' required by '+constructor.name + ' - dependencies : ', Object.keys(options.dependencies));
		}

		return arg.model || arg;
	}

	function args(constructor) {
		return (constructor.argNames || []).map(function(argName) {
			if (argName === 'options') {
				return options;
			}

			var argConstructor = requireArg(argName, constructor);
			if (argName === 'debug') {
				return argConstructor.create([Utils.extend({}, options, {
					name: constructor.name
				})]);
			}
			// console.log('arg : '+argName);
			var arg = create(argConstructor, constructor);
			return arg;
		});
	};

	function moduleOf(className) {
		for(var module in options.dependencies) {
			if(options.dependencies[module][className]) {
				return module;
			}
		}
		return className.replace(/view$/i, '');
	};

	function create(constructor, parent) {
		var prefix = options.namespace || 'bdsft_webrtc';
		global[prefix] = global[prefix] || {};
		var name = constructor.name;
		var id = getId(name);
		global[prefix][id] = global[prefix][id] || {};

		var createConstructor = function(){
			// console.log('factory : ' + id);
			var constructorArgs = args(constructor);
			// console.log('factory : create ' + id + ' with ', constructor.argNames);
			var module = moduleOf(name);
			var constructorOptions = Utils.extend({module: module}, parent && parent.options || {}, options);
			var object = constructor.create(constructorArgs, constructorOptions);
			return object;
		};

		// do not cache views
		if(name.match(/view/i)) {
			var object = createConstructor();
			if(!global[prefix][id][name]) {
				global[prefix][id][name] = object;
			} else {
				if(!Array.isArray(global[prefix][id][name])) {
					global[prefix][id][name] = [global[prefix][id][name]];
				}
				global[prefix][id][name].push(object);
			}
			return object;
		}

		if (!global[prefix][id][name]) {
			global[prefix][id][name] = createConstructor();
		}
		return global[prefix][id][name];
	}

	return create;
}
