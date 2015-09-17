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

  it('addUrlParams', function() {
    var url = 'http://test.com?a=1';
    var params = {b: 2, c: 3}
    expect(core.utils.addUrlParams(url, params)).toEqual(url+'&b=2&c=3');
  })

  it('addUrlParams with encoded param', function() {
    var url = 'http://test.com?a=1';
    var params = {b: 2, c: 'http://test.com?param1=test1'}
    expect(core.utils.addUrlParams(url, params)).toEqual(url+'&b=2&c=http%3A%2F%2Ftest.com%3Fparam1%3Dtest1');
  })

  it('addUrlParams with array', function() {
    var url = 'http://test.com';
    var params = {arr: ['A', 'B', 'C']}
    expect(core.utils.addUrlParams(url, params)).toEqual(url+'?arr=A&arr=B&arr=C');
  })

});