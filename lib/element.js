module.exports = Element;

function Element(object, name, databinder) {
	var self = {};

	var element = object.view.find('.' + name);
	if(!element) {
		console.error('no element found for ' + name);
		return;
	}

	object[name] = element;

	element.on('change', function(){
		databinder.viewChanged(name, get());
	});

	var isCheckbox = function() {
		return element.attr('type') === 'checkbox';
	};

	var isTextbox = function() {
		return (element.attr('type') === 'text' || element.attr('type') === 'password');
	};

	var isSelect = function() {
		return element && element[0] && element[0].nodeName.match(/select/i);
	};

	var get = function(){
		if(isCheckbox()){
			return element.prop('checked')
		} else if(isTextbox() || isSelect()) {
			return element.val();
		} else {
			// console.error('element is no input : ', element);
		}
	};

	var set = function(value){
		if(isCheckbox()){
			element.prop('checked', value);
		} else if(isTextbox() || isSelect()) {
			element.val(typeof value !== 'undefined' ? value : '');
		} else {
			element.text(typeof value !== 'undefined' ? value : '');
			// console.error('element is no input : ', element);
		}
	};

	databinder.onModelPropChange(name, function(value){
		set(value);
	});

	return self;
}