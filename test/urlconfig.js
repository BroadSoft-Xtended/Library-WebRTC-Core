require('./includes/common');
describe('urlconfig', function() {

  beforeEach(function() {
    core = require('../lib/app');
    testUA = core.testUA;
  });

  it('hd=true', function() {
  	location.search = '?hd=true'
    testUA.createCore('urlconfig');
    expect(urlconfig.hd).toEqual(true);
  });

  it('features url parameter', function() {
    location.search = '?features=1';
    testUA.createCore('urlconfig');
    expect(urlconfig.getFeatures()).toEqual(1);
    location.search = '';
  });
  it('with view url param', function() {
    location.search = '?view=audioOnly';
    testUA.createCore('urlconfig');
    expect(urlconfig.audioOnlyView).toEqual(true);
  });

});