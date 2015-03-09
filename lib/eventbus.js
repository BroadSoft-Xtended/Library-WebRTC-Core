module.exports = require('./bdsft').Model(EventBus);

var ee = require('event-emitter');

function EventBus() {
	var self = {};

	var lastEvents = {};

	var emitter = ee({});
	self.test = '121';
	
	self.on = function(type, listener){
		if(Array.isArray(type)) {
			type.forEach(function(t) {
				emitter.on(t, listener);
			});
		} else {
			emitter.on(type, listener);
		}
	};
	self.once = function(type, listener){
		if(Array.isArray(type)) {
			type.forEach(function(t) {
				emitter.once(t, listener);
			});
		} else {
			emitter.once(type, listener);
		}		
	};
	var doEmit = function(type, obj){
		lastEvents[type] = obj;
		emitter.emit(type, obj);
	};
	self.emit = function(type, obj){
		if(Array.isArray(type)) {
			type.forEach(function(t) {
				doEmit(t, obj);
			});
		} else {
			doEmit(type, obj);
		}
	};
	self.onToggleView = function(view, cb) {
		self.on('toggleView', function(e){
			if(e.view === view) {
				cb();
			}
		});
	};


	self.toggleView = function(view) {
		self.emit('toggleView', {view: view});
	};
	self.holdCall = function() {
		self.emit('holdCall', {});
	};
	self.callHeld = function(failure) {
		self.emit('callHeld', {failure: failure});
	};
	self.callResumed = function(failure) {
		self.emit('callResumed', {failure: failure});
	};
	self.resumeCall = function() {
		self.emit('resumeCall', {});
	};
	self.endCall = function() {
		self.emit('endCall', {});
	};
	self.attachView = function(view) {
		self.emit('attachView', {
			view: view
		});
	};
	self.message = function(text, level) {
		self.emit('message', {
			text: text,
			level: level
		});
	};
	self.canceled = function() {
		self.emit('canceled');
	};
	self.smsRemovedFailed = function(inboxItem) {
		self.emit('smsRemovedFailed', {inboxItem: inboxItem});
	};
	self.smsRemoved = function(inboxItem) {
		self.emit('smsRemoved', {inboxItem: inboxItem});
	};
	self.smsRemoving = function(inboxItem) {
		self.emit('smsRemoving', {inboxItem: inboxItem});
	};
	self.smsSending = function() {
		self.emit('smsSending', {});
	};
	self.shareFile = function(file) {		
		self.emit('shareFile', {
			file: file
		});
	};
	self.digit = function(digit, isFromDestination) {		
		self.emit('digit', {
			digit: digit,
			isFromDestination: isFromDestination
		});
	};
	self.viewChanged = function(view) {
		self.emit('viewChanged', {
			visible: view.visible,
			view: view.name || view._name.replace(/view$/i, '')
		});
	};
	self.resolutionChanged = function(resolution) {
		var resolutionObj = {
			type: resolution.resolutionType || resolution.type,
			encoding: resolution.resolutionEncoding || resolution.encodingResolution || resolution.encoding,
			display: resolution.resolutionDisplay || resolution.displayResolution || resolution.display
		};
		if(lastEvents['resolutionChanged'] && lastEvents['resolutionChanged'] !== resolutionObj) {
		}
		self.emit('resolutionChanged', resolutionObj);
	};
	self.bandwidthChanged = function(bandwidth) {
		var bandwidthObj = {
			type: bandwidth.bandwidthLow || bandwidth.low,
			encoding: bandwidth.bandwidthMed || bandwidth.med,
			display: bandwidth.bandwidthHigh || bandwidth.high
		};
		if(lastEvents['bandwidthChanged'] && lastEvents['bandwidthChanged'] !== bandwidthObj) {
		}
		self.emit('bandwidthChanged', bandwidthObj);
	};
	self.authenticationFailed = function(authentication) {
		self.emit('authenticationFailed', {
			userid: authentication.userid,
			authUserid: authentication.authUserid,
			password: authentication.password
		});
	};
	self.calling = function(destination, session) {
		self.emit('calling', {
			destination: destination,
			session: session
		});
	};
	self.modifier = function(which) {
		self.emit('modifier', {
			which: which
		});
	};
	self.screenshare = function(enabled) {
		self.emit('screenshare', {
			enabled: enabled
		});
	};
	self.screenshareFailure = function(e) {
		self.emit('screenshareFailure', {e: e});
	};
	self.signIn = function() {
		self.emit('signIn');
	};
	self.signOut = function() {
		self.emit('signOut');
	};

	return self;
}
