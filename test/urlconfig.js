var test = require('./includes/common');
describe('urlconfig', function() {

  it('hd=true', function() {
  	location.search = '?hd=true'
    test.createCore('urlconfig');
    expect(urlconfig.hd).toEqual(true);
  });

  it('features url parameter', function() {
    location.search = '?features=1';
    test.createCore('urlconfig');
    expect(urlconfig.getFeatures()).toEqual(1);
    location.search = '';
  });
  it('with view url param', function() {
    location.search = '?view=audioOnly';
    test.createCore('urlconfig');
    expect(urlconfig.audioOnlyView).toEqual(true);
  });

});