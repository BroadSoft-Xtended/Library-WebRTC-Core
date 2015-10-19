var Constants = require('./constants');
var StylesManager = require('bdsft-sdk-styles');
var stylesCore = require('../js/styles').core;
var loader = require('bdsft-sdk-loader');
var extend = require('extend');
module.exports = Loader;

function Loader(Widget, options) {
  var self = {};


  options = options || {};
  options.dependencies = extend({core: require('../')}, options.dependencies);
  options.beforeCreateCb = function(factoryOptions){
    StylesManager.inject('core', factoryOptions, {style: stylesCore, constants: Constants});
  };

  loader(Widget, options);
}