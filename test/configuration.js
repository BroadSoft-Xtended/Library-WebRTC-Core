require('./includes/common');
describe('configuration', function() {

  before(function() {
    config = {
      enableCallStats: false,
      domainTo: 'domain.to',
      domainFrom: 'domain.from'
    };
    core = require('../lib/app');
    testUA = core.testUA;
    testUA.createCore('configuration', config);
    testUA.createCore('sipstack', config);
    eventbus = bdsft_client_instances.eventbus_test;
    testUA.mockWebRTC();
  });

  it('setResolutionDisplay', function() {
    expect(configuration.getResolutionDisplay()).toEqual(core.constants.DEFAULT_RESOLUTION_DISPLAY);
    configuration.displayResolution = core.constants.R_1280x720;
    expect(configuration.getResolutionDisplay()).toEqual(core.constants.R_1280x720);
  });
  it('enabledFeatures', function() {
    expect(configuration.enabledFeatures()).toEqual(['enableMessages',
      'enableCallControl',
      'enableCallTimer',
      'enableCallHistory',
      'enableFullScreen',
      'enableSelfView',
      'enableDialpad',
      'enableMute',
      'enableRegistrationIcon',
      'enableConnectionIcon',
      'enableWindowDrag',
      'enableAutoAcceptReInvite',
      'enableConnectLocalMedia',
      'enableTransfer',
      'enableHold'
    ]);
  });
  it('websocketsServers', function() {
    configuration.websocketsServers = [{
      'ws_uri': 'ws://webrtc-gw1.broadsoft.com:8060',
      'weight': 0
    }, {
      'ws_uri': 'ws://webrtc-gw2.broadsoft.com:8060',
      'weight': 0
    }, {
      'ws_uri': 'ws://webrtc-gw.broadsoft.com:8060',
      'weight': 0
    }];
    sipstack.init();
    expect(sipstack.ua.configuration.ws_servers.length).toEqual(3);
  });
  it('networkUserId set', function() {
    configuration.networkUserId = '8323303809';
    sipstack.init();
    expect(sipstack.ua.configuration.authorization_user).toEqual('8323303809');
    expect(sipstack.ua.configuration.uri.toString()).toEqual('sip:8323303809@' + configuration.domainFrom);
    configuration.networkUserId = undefined;
  });
  it('WEBRTC-41 : networkUserId and userId set', function() {
    configuration.networkUserId = '8323303809';
    location.search = '?userid=8323303810';
    sipstack.init();
    expect(sipstack.ua.configuration.authorization_user).toEqual('8323303809', "networkUserId takes precendence over userid");
    configuration.networkUserId = undefined;
  });
  it('enableIms = true', function() {
    configuration.enableIms = true;
    sipstack.init();
    expect(sipstack.ua.configuration.enable_ims).toEqual(true);
  });
  it('enableIms = false', function() {
    configuration.enableIms = false;
    sipstack.init();
    expect(sipstack.ua.configuration.enable_ims).toEqual(false);
  });
  it('userid:', function() {
    sipstack.init();
    expect(sipstack.ua.configuration.uri !== undefined).toEqual(true);
  });
  it('getExSIPConfig() with userid with empty spaces', function() {
    configuration.userid = 'my user id';
    expect(configuration.getExSIPConfig().uri).toEqual("my%20user%20id@domain.from");
  });
  it('getExSIPOptions:', function() {
    configuration.encodingResolution = '640x480';
    configuration.audioOnly = undefined;
    var options = {
      mediaConstraints: {
        audio: true,
        video: {
          mandatory: {
            maxWidth: 640,
            maxHeight: 480
          }
        }
      },
      createOfferConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true
        }
      }
    };
    expect(configuration.getExSIPOptions()).toEqual(options);
  });
  it('getExSIPOptions with resolution', function() {
    configuration.audioOnly = undefined;
    configuration.hd = undefined;
    configuration.encodingResolution = '320x240';
    var options = {
      mediaConstraints: {
        audio: true,
        video: {
          mandatory: {
            maxWidth: 320,
            maxHeight: 240
          }
        }
      },
      createOfferConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true
        }
      }
    };
    expect(configuration.getExSIPOptions()).toEqual(options);
  });
  it('getExSIPOptions with view = audioOnly', function() {
    configuration.view = 'audioOnly';
    var options = {
      mediaConstraints: {
        audio: true,
        video: false
      },
      createOfferConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: false
        }
      }
    };
    expect(configuration.getExSIPOptions()).toEqual(options);
  });
  it('getExSIPOptions with resolution 960x720', function() {
    configuration.audioOnly = undefined;
    configuration.hd = undefined;
    configuration.view = undefined;
    configuration.encodingResolution = '960x720';
    var options = {
      mediaConstraints: {
        audio: true,
        video: {
          mandatory: {
            minWidth: 960,
            minHeight: 720
          }
        }
      },
      createOfferConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true
        }
      }
    };
    expect(configuration.getExSIPOptions()).toEqual(options);
  });
  it('getExSIPOptions with hd=true', function() {
    configuration.hd = true;
    configuration.view = undefined;
    configuration.encodingResolution = '960x720';
    var options = {
      mediaConstraints: {
        audio: true,
        video: {
          mandatory: {
            minWidth: 1280,
            minHeight: 720
          }
        }
      },
      createOfferConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true
        }
      }
    };
    expect(configuration.getExSIPOptions()).toEqual(options);
  });
  it('setClientConfigFlags', function() {
    var flags = configuration.getClientConfigFlags();

    for (var flag in configuration.Flags) {
      setClientConfigFlagAndAssert(flag);
    }

    configuration.setClientConfigFlags(flags);
  });
  it('features url parameter', function() {
    location.search = '?features=524287';
    testUA.createCore('configuration', config);
    expect(configuration.getClientConfigFlags()).toEqual(524287);
    location.search = '';
  });
  it('with view url param', function() {
    location.search = '?view=audioOnly';
    testUA.createCore('configuration', config);
    configuration.view = ''
    expect(configuration.views).toEqual(['audioOnly']);
  });
  it('with configuration.view param', function() {
    location.search = '';
    configuration.view = 'audioOnly';
    expect(configuration.views).toEqual(['audioOnly']);
  });
  it('with configuration.view param and url params', function() {
    location.search = '?view=centered';
    testUA.createCore('configuration', config);
    configuration.view = 'audioOnly';
    expect(configuration.views).toEqual(['audioOnly', 'centered']);
  });
  it('without color url param', function() {
    location.search = '';
    expect(configuration.getBackgroundColor()).toEqual("#ffffff");
  });
  it('with color url param', function() {
    location.search = '?color=red';
    testUA.createCore('configuration', config);
    expect(configuration.getBackgroundColor()).toEqual('#ff0000');
  });
  it('with color url param as hex', function() {
    location.search = '?color=d0d0d0';
    testUA.createCore('configuration', config);
    expect(configuration.getBackgroundColor()).toEqual('#d0d0d0');
  });
  it('with color url param as transparent', function() {
    location.search = '?color=transparent';
    testUA.createCore('configuration', config);
    expect(configuration.getBackgroundColor()).toEqual('transparent');
  });
  it('with settingUserID', function() {
    configuration.userid = '12345';
    configuration.getPassword = function() {
      return false;
    }
    expect(configuration.getExSIPConfig("1509", false).register).toEqual(true);
    testUA.connect();
    var registered = false;
    eventbus.on("registered", function(e) {
      registered = true;
    });
    sipstack.ua.emit('registered', sipstack.ua);
    expect(registered).toEqual(true, "should have received registered from UA");
  });
  it('without settingUserID', function() {
    configuration.userid = '';
    configuration.getPassword = function() {
      return false;
    }
    expect(configuration.getExSIPConfig("1509", "4009").register).toEqual(false);
  });
  it('without settingUserID and with configuration.register', function() {
    configuration.register = true;
    configuration.userid = '';
    configuration.getPassword = function() {
      return false;
    }
    expect(configuration.getExSIPConfig("1509", false).register).toEqual(true);
    testUA.connect();
    var registered = false;
    eventbus.on("registered", function(e) {
      registered = true;
    });
    sipstack.ua.emit('registered', sipstack.ua);
    expect(registered).toEqual(true, "should have received registered from UA");
  });


  function setClientConfigFlagAndAssert(flagName) {
    var flagValue = configuration.Flags[flagName];
    configuration.setClientConfigFlags(flagValue);
    assertClientConfigFlags([flagName], true);
    expect(configuration.getClientConfigFlags()).toEqual(flagValue);
  }

  function assertClientConfigFlags(names, enabled) {
    for (var i = 0; i < names.length; i++) {
      expect(configuration[names[i]]).toEqual(enabled, "Should be " + (enabled ? "enabled" : "disabled") + " : " + names[i]);
    }
  }
});