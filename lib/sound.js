module.exports = require('./bdsft').Model(Sound, {
  media: require('../js/media'),
  config: require('../js/config')
});

var utils = require('./utils');

function Sound(eventbus) {
  var self = {};

  var soundOut;
  var soundOutDTMF;
  var audioRingtone;

  self.init = function() {
    soundOut = utils.createElement('<audio>', {volume: self.volumeClick});
    soundOutDTMF = utils.createElement('<audio>', {volume: self.volumeDTMF});
    audioRingtone = utils.createElement('<audio>', {volume: self.volumeRingtone});
  };

  self.listeners = function(sipstackDatabinder) {
    sipstackDatabinder.onModelPropChange('failed', function(failed){
      if(failed) {
        self.pause();
      }
    });
    eventbus.on(["disconnected", "endCall", "ended", "resumed", "started"], function(e) {
      self.pause();
    });
    eventbus.on("progress", function(e) {
      self.playDtmfRingback();
    });
    eventbus.on('newDTMF', function(e) {
      var digit = e.data.tone;
      debug.log('DTMF sent : ' + digit);
      if (!digit) {
        return;
      }
      var file = null;
      if (digit === "*") {
        file = "star";
      } else if (digit === "#") {
        file = "pound";
      } else {
        file = digit;
      }
      self.playDtmfTone(file);
    });    
  };

  self.pause = function() {
    soundOut.trigger('pause');
    soundOutDTMF.trigger('pause');
    audioRingtone.trigger('pause');
  };

  self.playDtmfRingback = function() {
    self.playDtmf("dtmf-ringback", {
      loop: true
    });
  };

  self.playRingtone = function() {
    self.playTone(audioRingtone, 'ringtone', {
      loop: true
    });
  };

  self.playDtmfTone = function(tone) {
    self.playDtmf("dtmf-" + tone);
  };

  self.playClick = function() {
    self.play("click");
  };

  self.play = function(media, options) {
    self.playTone(soundOut, media, options);
  };

  self.playTone = function(audioSource, media, options) {
    // avoid restarting same playing audio
    if (audioSource.attr("src") === media && !audioSource[0].paused) {
      return;
    }
    options = options || {};
    if(!self.medias[media]) {
      console.error(media + ' not found for sound in ', Object.keys(self.medias))
      return;
    }
    audioSource.attr("src", 'data:audio/ogg;base64,'+self.medias[media]);
    if (options.loop) {
      audioSource.attr('loop', 'true');
    } else {
      audioSource.removeAttr('loop');
    }
    audioSource.trigger('play');
  };

  self.playDtmf = function(media, options) {
    self.playTone(soundOutDTMF, media, options);
  };

  return self;
}
