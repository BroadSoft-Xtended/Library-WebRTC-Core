module.exports = require('./bdsft').Model(Screenshare, {
  config: require('../js/config')
})

function Screenshare(eventbus, urlconfig) {
  var self = {};

  self.props = ['visible'];

  self.bindings = {
    enableScreenshare: {
      urlconfig: 'enableScreenshare'
    }
  }

  self.listeners = function(){
      // TODO - screenSharingUnsupported not implemented
    // eventbus.on('screenshareFailure', function(e) {
      // no way to distinguish between flag not enabled or simply rejected enabling screen sharing
      // if (e.e) {
      //   self.screenSharingUnsupported.show();
      // }
    // });
  };

  self.start = function() {
    self.visible = true;
  };

  self.stop = function() {
    self.visible = false;
  };

  return self;
}