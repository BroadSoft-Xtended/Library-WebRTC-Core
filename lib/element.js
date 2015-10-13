module.exports = Element;

function Element(object, name, databinder) {
	var self = {};

	var element = object.view.find('.' + name);
	if(!element || !element.length) {
		console.warn('no element found for ' + name + ' in template '+object._name);
		return;
	}

	object[name] = element;

	element.on('change', function(){
		databinder.viewChanged(name, get(), self);
	});

	var isCheckbox = function() {
		return element.attr('type') === 'checkbox';
	};

	var isTextbox = function() {
		return (element.attr('type') === 'text' || element.attr('type') === 'password' || element.is('textarea'));
	};

	var isImage = function() {
		return element.is('img');
	};

	var isSelect = function() {
		return element && element[0] && element[0].nodeName.match(/select/i);
	};

	var get = function(){
		if(isCheckbox()){
			return element.prop('checked')
		} else if(isTextbox() || isSelect()) {
			return element.val();
		} else if(isImage()) {
			return element.attr('src');
		} else {
			return element.text();
			// console.error('element is no input : ', element);
		}
	};

	var set = function(value){
		var attrs;
		var val = value;
		if(typeof value === 'object' && value !== null) {
			val = value._val;
			attrs = value;
		}

		if(isCheckbox()){
			element.prop('checked', val);
		} else if(isTextbox() || isSelect()) {
			element.val(typeof val !== 'undefined' ? val : '');
		} else if(isImage()) {
			element.attr('src', val !== 'undefined' ? val : '');
		} else {
			element.text(typeof val !== 'undefined' ? val : '');
			// console.error('element is no input : ', element);
		}
		if(attrs) {
			element.attr(attrs);
		}
	};

	databinder.onModelPropChange(name, function(value){
		set(value);
		// databinder.viewChanged(name, value);
	});

	// add view listener to handle mutliple views sync
	databinder.onViewElChange(name, function(value, name, sender){
		if(sender !== self) {
			set(value);
		}
	});

	return self;
}