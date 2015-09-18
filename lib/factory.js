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

	function moduleOf(className, constructor) {
		var module = Utils.decamelize(className).split(' ')[0];
		if(options.dependencies[module]) {
			var name = className.replace(module, '').toLowerCase();
			if(options.dependencies[module][name]) {
				return module;
			}
		}

		// lookup in parent module
		if(constructor) {
			var module = options.dependencies[constructor.module];
			if(module && module[className]) {
				return constructor.module;
			}
		}

		// lookup name in all dependencies
		var modules = Object.keys(options.dependencies);
		for(var i=0; i < modules.length; i++){
			var module = modules[i];

			var dependency = options.dependencies[module][className] || options.dependencies[module][className.toLowerCase()];
			if(dependency) {
				return module;
			}

			if(options.dependencies[module].model && module === className) {
				return module;
			}
			if(options.dependencies[module].view && module === className.replace(/view$/i, '')) {
				return module;
			}
		}

		throw Error('factory error : could not find module for '+className + ' required by '+constructor.name + ' - dependencies : ' + JSON.stringify(Object.keys(options.dependencies)));
	};

	function requireArg(argName, constructor) {
		var module = moduleOf(argName, constructor);
		// console.log('requireArg : '+argName + ', module : '+module+', constructor : '+constructor.name);
		if(options.dependencies[module].model && module === argName) {
			return options.dependencies[module].model;
		}
		if(options.dependencies[module].view && module === argName.replace(/view$/i, '')) {
			return options.dependencies[module].view;
		}
		if(options.dependencies[module][argName]){
			return options.dependencies[module][argName];
		}
		argName = argName.replace(module, '').toLowerCase();
		if(options.dependencies[module][argName]){
			return options.dependencies[module][argName];
		}
		throw Error('factory error : could not find dependency for '+argName + ' required by '+constructor.name + ' - dependencies : ' +  JSON.stringify(Object.keys(options.dependencies)));
	}

	function args(constructor, argsMap) {
		return (constructor.argNames || []).map(function(argName) {
			if(argsMap && argsMap[argName]) {
				return argsMap[argName];
			}
			if (argName === 'options') {
				return options;
			}

			var argConstructor = requireArg(argName, constructor);
			if (argName === 'debug') {
				return argConstructor.create([Utils.extend({}, options, {
					name: constructor.name
				})], options);
			}
			// console.log('arg : '+argName);
			var arg = create(argConstructor, constructor, argName);
			return arg;
		});
	};

	function create(constructor, parent, name, argsMap, opts) {
		opts = opts || {};
		if(typeof constructor === 'string') {
			constructor = requireArg(constructor);
		}
		var prefix = options.namespace || 'bdsft_webrtc';
		global[prefix] = global[prefix] || {};
		name = name || constructor.name;
		var id = getId(name);
		global[prefix][id] = global[prefix][id] || {};
		var module = moduleOf(name, parent);
		constructor.module = module;
		global[prefix][id][module] = global[prefix][id][module] || {};
		// console.log('factory create : '+module+'.'+constructor.name+' in '+(parent && parent.module)+'.'+(parent && parent.name));
		var createConstructor = function(){
			try{
				// console.log('factory : ' + id);
				var constructorArgs = args(constructor, argsMap);
				// console.log('factory : create ' + id + ' with ', constructor.argNames);
				var constructorOptions = Utils.extend({module: module}, parent && parent.options || {}, options);
				var object = constructor.create && constructor.create(constructorArgs, constructorOptions) || constructor;
				return object;
			} catch(e) {
				console.error('factory : '+(constructor.name || constructor)+' : '+e);
				console.error(e.stack);
			}
		};

		name = name.toLowerCase();
		// do not cache views
		if(name.match(/view/i) || opts.force) {
			var object = createConstructor();
			if(!global[prefix][id][module][name]) {
				global[prefix][id][module][name] = object;
			} else {
				if(!Array.isArray(global[prefix][id][module][name])) {
					global[prefix][id][module][name] = [global[prefix][id][module][name]];
				}
				global[prefix][id][module][name].push(object);
			}
			return object;
		}

		if (!global[prefix][id][module][name]) {
			global[prefix][id][module][name] = createConstructor();
		}
		return global[prefix][id][module][name];
	}

	return create;
}
