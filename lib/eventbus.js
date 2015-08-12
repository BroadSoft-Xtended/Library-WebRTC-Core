module.exports = require('./bdsft').Model(EventBus);

var ee = require('event-emitter');

function EventBus() {
	var self = {};

	var lastEvents = {};

	var emitter = ee({});

	self.on = function(type, listener) {
		if (Array.isArray(type)) {
			type.forEach(function(t) {
				emitter.on(t, listener);
			});
		} else {
			emitter.on(type, listener);
		}
	};
	self.once = function(type, listener) {
		if (Array.isArray(type)) {
			type.forEach(function(t) {
				emitter.once(t, listener);
			});
		} else {
			emitter.once(type, listener);
		}
	};
	var doEmit = function(type, obj) {
		lastEvents[type] = obj;
		emitter.emit(type, obj);
	};
	self.emit = function(type, obj) {
		if (Array.isArray(type)) {
			type.forEach(function(t) {
				doEmit(t, obj);
			});
		} else {
			doEmit(type, obj);
		}
	};
	self.endCall = function() {
		self.emit('endCall', {});
	};
	self.userMediaUpdated = function(localStream) {
		self.emit('userMediaUpdated', {localStream: localStream});
	};
	self.incomingCall = function(data) {
		self.emit('incomingCall', data);
	};
	self.progress = function(data) {
		self.emit('progress', data);
	};
	self.started = function(data) {
		self.emit('started', data);
	};
	self.failed = function(data) {
		self.emit('failed', data);
	};
	self.ended = function(data) {
		self.emit('ended', data);
	};
	self.held = function(data) {
		self.emit('held', data);
	};
	self.resumed = function(data) {
		self.emit('resumed', data);
	};
	self.dataSent = function(data) {
		self.emit('dataSent', data);
	};
	self.dataReceived = function(data) {
		self.emit('dataReceived', data);
	};
	self.newDTMF = function(data) {
		self.emit('newDTMF', data);
	};
	self.reInvite = function(data) {
		self.emit('reInvite', data);
	};
	self.digit = function(digit, isFromDestination) {
		self.emit('digit', {
			digit: digit,
			isFromDestination: isFromDestination
		});
	};
	self.iceconnected = function(sender, data) {
		self.emit("iceconnected", {
			sender: sender,
			data: data
		});
	};
	self.icecompleted = function(sender, data) {
		self.emit("icecompleted", {
			sender: sender,
			data: data
		});
	};
	self.iceclosed = function(sender, data) {
		self.emit("iceclosed", {
			sender: sender,
			data: data
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

	return self;
}