require('./includes/common');
describe('sipstack', function() {

  beforeEach(function() {
    core = require('webrtc-core');
    testUA = core.testUA;
    testUA.createCore('configuration');
    testUA.createCore('sipstack');
    testUA.mockWebRTC();
  });

  it('RTCMediaHandlerOptions and bandwidth med change', function() {
    configuration.allowOutside = true;
    
    sipstack.ua.setRtcMediaHandlerOptions = function(options) {
      rtcMediaHandlerOptions = options;
    }
    configuration.resolutionType = core.constants.WIDESCREEN;
    configuration.encodingResolution = core.constants.R_640x360;
    configuration.bandwidthMed =  "600";
    expect(configuration.encodingResolution).toEqual('640x360');
    expect(rtcMediaHandlerOptions).toEqual({
      RTCConstraints: {
        'optional': [],
        'mandatory': {}
      },
      "disableICE": true,
      "reuseLocalMedia": true,
      "videoBandwidth": "600"
    });
  });
  it('RTCMediaHandlerOptions and bandwidth low change for resolution 180', function() {
    configuration.allowOutside = true;
    
    sipstack.ua.setRtcMediaHandlerOptions = function(options) {
      rtcMediaHandlerOptions = options;
    }
    configuration.bandwidthLow = "200";
    configuration.resolutionType = core.constants.WIDESCREEN;
    configuration.encodingResolution = core.constants.R_320x180;
    expect(rtcMediaHandlerOptions).toEqual({
      RTCConstraints: {
        'optional': [],
        'mandatory': {}
      },
      "disableICE": true,
      "reuseLocalMedia": true,
      "videoBandwidth": "200"
    });
  });
});