var Constants = require('./constants');
var StylesManager = require('bdsft-sdk-styles');
var stylesCore = require('../js/styles').core;

module.exports = Loader;

function Loader(Widget, options) {
  var self = {};


  options = options || {};
  options.dependencies.core = require('../');
  options.beforeCreateCb = function(factoryOptions){
    StylesManager.inject('core', factoryOptions, {style: stylesCore, constants: Constants});
  };

  require('bdsft-sdk-loader')(Widget, options);
}