require('./includes/common');
describe('utils', function() {

  before(function() {
    core = require('../lib/app');
  });
  
  it('isValidUsPstn', function() {
    expect(core.utils.isValidUsPstn('240-534-2345')).toEqual( true);
    expect(core.utils.isValidUsPstn('1240-534-2345')).toEqual( true);
    expect(core.utils.isValidUsPstn('1(240)-(534)-(2345)')).toEqual( true);
    expect(core.utils.isValidUsPstn('(240)-(534)-(2345)')).toEqual( true);
    expect(core.utils.isValidUsPstn('(240)(534)(2345)')).toEqual( true);
    expect(core.utils.isValidUsPstn('22345678908')).toEqual( false);
    expect(core.utils.isValidUsPstn('asasdasdas')).toEqual( false);
  });

  it('getSearchVariable', function() {
    location.search = '?view=audioOnly&enableCallControl=true';
    expect(core.utils.getSearchVariable('view')).toEqual('audioOnly');
    expect(core.utils.getSearchVariable('enableCallControl')).toEqual(true);
    expect(core.utils.getSearchVariable('enableMessages')).toEqual(undefined);
  })

  it('getSearchVariables', function() {
    location.search = 'view=audioOnly&enableCallControl=true';
    expect(core.utils.getSearchVariables()).toEqual({"view":"audioOnly","enableCallControl":true});
  })

});