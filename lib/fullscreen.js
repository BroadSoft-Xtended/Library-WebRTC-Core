module.exports = require('./bdsft').Model(Fullscreen, {
  config: require('../js/config')
})

var Utils = require('./utils');

function Fullscreen(eventbus, urlconfig) {
  var self = {};

  self.updateWebkitFullscreen = function(){
    if(!self.visible) {
      if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    } else {
      if (document.webkitRequestFullScreen) {
        document.webkitRequestFullScreen();
      }      
    }
  };

  self.props = ['visible'];

  self.bindings = {
    enableFullscreen: {
      urlconfig: 'enableFullscreen'
    },
    webkitFullscreen: {
      fullscreen: 'visible'
    }
  }

  self.start = function() {
    self.visible = true;
  };
  self.stop = function(){
    self.visible = false;
  };

  self.listeners = function() {
    Utils.getElement(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', function(e) {
      var enable = document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen;
      if(enable) {
        self.start();
      } else {
        self.stop();
      }
    });
    eventbus.on('endCall', function(){
      self.stop();
    });
  };

  return self;
}