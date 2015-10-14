test = require('bdsft-sdk-test').model;
describe('urlconfig', function() {

  var create = function(){
    test.createModelAndView('core', {
      core: require('../')
    }, 'urlconfig');
  }

  it('hd=true', function() {
    location.search = '?hd=true'
    create();
    expect(urlconfig.hd).toEqual(true);
  });

  it('features url parameter', function() {
    location.search = '?features=1';
    create();
    expect(urlconfig.getFeatures()).toEqual(1);
    location.search = '';
  });
  it('with view url param', function() {
    location.search = '?view=audioOnly';
    create();
    expect(urlconfig.audioOnlyView).toEqual(true);
  });
  it('view change', function() {
    location.search = '?view=audioVideo';
    create();
    expect(urlconfig.audioOnlyView).toEqual(false);
    urlconfig.setViewAudio();
    expect(urlconfig.audioOnlyView).toEqual(true);
  });
  it('enableMessages=false', function() {
    location.search = '?enableMessages=false';
    create();
    expect(urlconfig.enableMessages).toEqual(false);
  });
  it('toString', function() {
    create();
    expect(urlconfig+'').toEqual('{\"view\":\"audioVideo\",\"enableMessages\":false,\"audioOnlyView\":false}');
  });
  it('parse', function() {
    create();
    urlconfig.parse('{\"view\":\"audioOnly\",\"enableMessages\":true}')
    expect(urlconfig.view).toEqual('audioOnly');
    expect(urlconfig.enableMessages).toEqual(true);
  });

});