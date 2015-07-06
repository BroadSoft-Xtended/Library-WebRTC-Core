module.exports = require('./bdsft').Model(Audio);

var utils = require('./utils');

function Audio(eventbus, sipstack) {
  var self = {};

  self.updateLocalAudio = function() {
    enableLocalAudio(!self.muted);
  };

  var enableLocalAudio = function(enabled) {
    var localStreams = sipstack.getLocalStreams();
    if (!localStreams || localStreams.length === 0) {
      return;
    }
    var localMedia = localStreams[0];
    var localAudio = localMedia.getAudioTracks()[0];
    localAudio.enabled = enabled;
  };

  self.props = ['muted'];

  self.bindings = {
    localAudio: {
      audio: 'muted'
    }
  };

  self.mute = function() {
    self.muted = true;
  };

  self.unmute = function() {
    self.muted = false;
  };
  
  self.listeners = function() {
    eventbus.on(["resumed", "started", "userMediaUpdated"], function() {
      self.updateLocalAudio();
    });
  };

  return self;
}
