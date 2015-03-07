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
		return element[0].nodeName.match(/select/i);
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
			element.val(value);
		} else {
			console.error('element is no input : ', element);
		}
	};

	databinder.onModelChange(function(_name, value){
		if(_name === name) {
			set(value);
		}
	});

	return self;
}