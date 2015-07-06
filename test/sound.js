require('./includes/common');
describe('sound', function() {

  beforeEach(function() {
    core = require('../lib/app');
    testUA = core.testUA;
    testUA.createCore('sound');
    eventbus = global.bdsft_client_instances.test.eventbus;
  });

  it('incoming call and playClick', function() {
    eventbus.progress();
    sound.playClick();
  });
});