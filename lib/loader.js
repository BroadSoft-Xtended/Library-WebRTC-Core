// var jQuery = jquery = $ = require('jquery');
// require('jquery.cookie')
// var core = require('webrtc-core');
var Constants = require('./constants');
var Utils = require('./utils');
var Factory = require('./factory');

module.exports = Loader;

function Loader(Widget, options) {
  var self = {};

  self.asScript = function(src, config, styles) {
    var script = '<script src="' + src + '" ';
    var dataStrs = Object.keys(styles).map(function(key) {
      var value = styles[key];
      return "data-" + key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + "='" + value + "'";
    });
    script += dataStrs.join(' ');
    script += '>\n' + JSON.stringify(config, undefined, 2) + '\n</script>';
    return script;
  };

  var currentScript = Utils.getElement('script').last();
  Utils.getElement(document).ready(function() {
    window.BroadSoftWebRTC = window.BroadSoftWebRTC || {};
    window.BroadSoftWebRTC.widgets = [];

    var configData = currentScript.text().trim() ? JSON.parse(currentScript.text()) : {};
    console.log("script config : ", configData);
    var styleData = currentScript.data();
    var src = currentScript[0].src;
    var widget = self.create(configData, styleData, src);
    widget.appendTo(currentScript.parent());
    currentScript.remove();
    window.BroadSoftWebRTC.widgets.push(widget);
  });

  self.create = function create(configData, styleData, src) {
    var count = window.BroadSoftWebRTC && window.BroadSoftWebRTC.widgets && window.BroadSoftWebRTC.widgets.length;
    var id =  (!count || count === 0) && 'default' || 'webrtc'+count;
    var namespace = "bdsft_webrtc";
    var factoryOptions = require('deep-extend')({id: id, namespace: namespace}, options, configData);
    factoryOptions.dependencies.core = require('../');
    factoryOptions.styleData = styleData;
    var widget = Factory(factoryOptions)(Widget.view);

    var modules = function(){
      return window[factoryOptions.namespace][factoryOptions.id];
    }
    if(!widget.asScript) {
      widget.asScript = function(){
        var configs = {};
        for(var name in modules()) {
          var module = modules()[name];
          var changes = module.configChanges && module.configChanges();
          configs = Utils.extend(configs, {name: changes});
        }
        return self.asScript(src, configs, styleData);
      };
    }
    if(!widget.updateConfig) {
      widget.updateConfig = function(config){
        for(var name in modules()) {
          var module = modules()[name];
          module.updateConfig && module.updateConfig(config && config[name] || config);
        }
      };
    }
    return widget;
  }


  // (function($) {
  //   $.isBlank = function(obj) {
  //     return (!obj || $.trim(obj) === "");
  //   };
  // })(jQuery);

  if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
      return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
  }

  return self;
}

// Object.defineProperties(WebRTC, {
//   version: {
//     get: function() {
//       return '<%= pkg.version %>';
//     }
//   },
//   name: {
//     get: function() {
//       return '<%= pkg.title %>';
//     }
//   }
// });

// if(!jQuery.fn) {
//   jQuery.fn = {};
// }
// jQuery.fn.putCursorAtEnd = function() {

//   return this.each(function() {

//     $(this).focus();

//     // If this function exists...
//     if (this.setSelectionRange) {
//       // ... then use it (Doesn't work in IE)

//       // Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
//       var len = $(this).val().length * 2;

//       this.setSelectionRange(len, len);

//     } else {
//       // ... otherwise replace the contents with itself
//       // (Doesn't work in Google Chrome)

//       $(this).val($(this).val());

//     }

//     // Scroll to the bottom, in case we're in a tall textarea
//     // (Necessary for Firefox and Google Chrome)
//     this.scrollTop = 999999;

//   });

// };

// if(!jQuery.cssHooks) {
//   jQuery.cssHooks = {};
// }
// jQuery.cssHooks.backgroundColor = {
//   get: function(elem) {
//     var bg = null;
//     if (elem.currentStyle) {
//       bg = elem.currentStyle.backgroundColor;
//     } else if (window.getComputedStyle) {
//       bg = document.defaultView.getComputedStyle(elem,
//         null).getPropertyValue("background-color");
//     }
//     if (bg.search("rgb") === -1 || bg === 'transparent') {
//       return bg;
//     } else {
//       bg = bg.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+).*\)$/);
//       var hex = function(x) {
//         return ("0" + parseInt(x, 10).toString(16)).slice(-2);
//       };
//       return "#" + hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
//     }
//   }
// };