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
    eventbus = bdsft_client_instances.test.eventbus;
    testUA.mockWebRTC();
  });

  // it('enabledFeatures', function() {
  //   expect(configuration.enabledFeatures()).toEqual(['enableMessages',
  //     'enableCallControl',
  //     'enableCallTimer',
  //     'enableCallHistory',
  //     'enableFullScreen',
  //     'enableSelfView',
  //     'enableDialpad',
  //     'enableMute',
  //     'enableRegistrationIcon',
  //     'enableConnectionIcon',
  //     'enableWindowDrag',
  //     'enableAutoAcceptReInvite',
  //     'enableConnectLocalMedia',
  //     'enableTransfer',
  //     'enableHold'
  //   ]);
  // });
  // it('setFeatures', function() {
  //   var flags = configuration.getFeatures();

  //   for (var flag in configuration.Flags) {
  //     setClientConfigFlagAndAssert(flag);
  //   }

  //   configuration.setFeatures(flags);
  // });
  // it('features url parameter', function() {
  //   location.search = '?features=524287';
  //   testUA.createCore('configuration', config);
  //   expect(configuration.getFeatures()).toEqual(524287);
  //   location.search = '';
  // });
  // it('with view url param', function() {
  //   location.search = '?view=audioOnly';
  //   testUA.createCore('configuration', config);
  //   configuration.view = ''
  //   expect(configuration.views).toEqual(['audioOnly']);
  // });
  // it('with configuration.view param', function() {
  //   location.search = '';
  //   configuration.view = 'audioOnly';
  //   expect(configuration.views).toEqual(['audioOnly']);
  // });
  // it('with configuration.view param and url params', function() {
  //   location.search = '?view=centered';
  //   testUA.createCore('configuration', config);
  //   configuration.view = 'audioOnly';
  //   expect(configuration.views).toEqual(['audioOnly', 'centered']);
  // });
  // it('without color url param', function() {
  //   location.search = '';
  //   expect(configuration.getBackgroundColor()).toEqual("#ffffff");
  // });
  // it('with color url param', function() {
  //   location.search = '?color=red';
  //   testUA.createCore('configuration', config);
  //   expect(configuration.getBackgroundColor()).toEqual('#ff0000');
  // });
  // it('with color url param as hex', function() {
  //   location.search = '?color=d0d0d0';
  //   testUA.createCore('configuration', config);
  //   expect(configuration.getBackgroundColor()).toEqual('#d0d0d0');
  // });
  // it('with color url param as transparent', function() {
  //   location.search = '?color=transparent';
  //   testUA.createCore('configuration', config);
  //   expect(configuration.getBackgroundColor()).toEqual('transparent');
  // });


  function setClientConfigFlagAndAssert(flagName) {
    var flagValue = configuration.Flags[flagName];
    configuration.setFeatures(flagValue);
    assertClientConfigFlags([flagName], true);
    expect(configuration.getFeatures()).toEqual(flagValue);
  }

  function assertClientConfigFlags(names, enabled) {
    for (var i = 0; i < names.length; i++) {
      expect(configuration[names[i]]).toEqual(enabled, "Should be " + (enabled ? "enabled" : "disabled") + " : " + names[i]);
    }
  }
});