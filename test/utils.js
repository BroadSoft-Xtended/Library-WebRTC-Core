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
});