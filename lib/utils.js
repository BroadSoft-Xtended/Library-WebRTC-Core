var adapter = require('./adapter');
var $ = require('jquery');
var extend = require('extend');
var utils = require('bdsft-sdk-utils');

var __slice = [].slice;

var Utils = extend(utils, {
  getElement: function(selector) {
    return $(selector);
  },
  createEvent: function(eventName) {
    return $.Event(eventName)
  },
  createElement: function(tagName, attributes, options) {
    options = options || {};
    var el = $(tagName, attributes);
    el.appendTo(options.parent || $('body'));
    return el;
  },
  resolutionWidth: function(resolution) {
    if (resolution) {
      var resolutions = resolution.split('x');
      return parseInt(resolutions[0], 10);
    }
  },
  resolutionHeight: function(resolution) {
    if (resolution) {
      var resolutions = resolution.split('x');
      return parseInt(resolutions[1], 10);
    }
  },

  containsKey: function(object, value) {
    return this.keyIndex(object, value) !== -1;
  },

  keyIndex: function(object, value) {
    return $.inArray(value, $.map(object, function(key) { return key; }));
  },

  containsValue: function(object, value) {
    return this.valueIndex(object, value) !== -1;
  },

  valueIndex: function(object, value) {
    return $.inArray(value, $.map(object, function(key, value) { return value; }));
  },

  addSelectOptions: function(options, selector, value) {
    $.each(options, function(key, value) {
      $(selector)
        .append($('<option>', { value : value })
        .text(key));
    });
    if(value) {
      selector.val(value);
    }
  },

  // Generate a random userid
  randomUserid: function()
  {
    var chars = "0123456789abcdef";
    var string_length = 10;
    var userid = '';
    for (var i=0; i<string_length; i++)
    {
      var rnum = Math.floor(Math.random() * chars.length);
      userid += chars.substring(rnum,rnum+1);
    }
    return userid;
  },

  whiteboardCompabilityCheck: function()
  {
    var isChrome = this.isChrome();

    // Only Chrome 34+
    if (!isChrome)
    {
      return "Chrome is required for whiteboard feature, please go to:<br>" +
        "<a href='http://chrome.google.com'>http://chrome.google.com</a>";
    }
    var major = this.majorVersion();
    if (isChrome && major < 34)
    {
      return "Your version of Chrome must be upgraded to at least version 34 in order to be able to use the whiteboard<br>" +
        "Please go to: <a href='http://chrome.google.com'>http://chrome.google.com</a> or <a href='https://www.google.com/intl/en/chrome/browser/canary.html'>https://www.google.com/intl/en/chrome/browser/canary.html</a>";
    }
  },

  compatibilityCheck: function()
  {
    var isChrome = this.isChrome();
    var isFirefox = this.isFirefox();

    // Only Chrome 25+ and Firefox 22+ are supported
    if (!isChrome && !isFirefox)
    {
      return "Chrome or Firefox is required, please go to:<br>" +
        "<a href='http://chrome.google.com'>http://chrome.google.com</a> or <a href='http:www.mozilla.org'>http://www.mozilla.org</a>";
    }
    var major = this.majorVersion();
    if (isChrome && major < 25)
    {
      return "Your version of Chrome must be upgraded to at least version 25<br>" +
        "Please go to: <a href='http://chrome.google.com'>http://chrome.google.com</a>";
    }
    else
    {
      if (isFirefox && major < 22)
      {
        return "Your version of Firefox must be upgraded to at least version 22y<br>" +
          "Please go to: <a href='http://www.mozilla.org'>http://www.mozilla.org</a>";
      }
    }
  },

  majorVersion: function(){
    return adapter.webrtcDetectedVersion;
  },

  isChrome: function(){
    return adapter.webrtcDetectedBrowser === 'chrome';
  },

  isFirefox: function(){
    return adapter.webrtcDetectedBrowser === 'firefox';
  },

  toArray: function(elements){
    return $(elements).map (function () {return this.toArray(); } );
  },

  rebindListeners: function(type, elements, listener){
    for(var i=0; i<elements.length; i++) {
      this.rebindListener(type, elements[i], listener);
    }
  },

  rebindListener: function(type, element, listener){
    element.off(type);
    element.on(type, listener);
  },

  parseDTMFTones: function(destination) {
    if(!destination) {
      return null;
    }
    var dtmfMatch = destination.match(/,[0-9A-D#*,]+/, '');
    return dtmfMatch ? dtmfMatch[0] : null;
  }
});

module.exports = Utils;