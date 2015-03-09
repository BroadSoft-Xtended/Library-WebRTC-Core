module.exports = require('./bdsft').Model(Configuration);

var Flags = {
  enableHD: 1,
  enableCallControl: 2,
  enableCallTimer: 4,
  enableCallHistory: 8,
  enableFullScreen: 16,
  enableSelfView: 32,
  enableCallStats: 64,
  enableDialpad: 128,
  enableMute: 256,
  enableMessages: 512,
  enableRegistrationIcon: 1024,
  enableConnectionIcon: 2048,
  enableWindowDrag: 4096,
  enableSettings: 8192,
  enableAutoAnswer: 16384,
  enableAutoAcceptReInvite: 32768,
  enableConnectLocalMedia: 65536,
  enableTransfer: 131072,
  enableHold: 262144,
  enableIms: 524288
};

Configuration.Flags = Flags;

var Utils = require('./utils');
var WebRTC_C = require('./constants');
var jQuery = $ = require('jquery');
require('jquery.cookie');
// TODO : hack to test in node js directly
// if(typeof document === 'undefined') {
//   document = {};
// }
// var $.cookie = require('$.cookie-cutter')(document);

function Configuration(options, eventbus, debug) {
  var self = {};
  options = options || {};

  var screenshare = false;
  var offerToReceiveVideo = true;
  
  self.props = {
    userid:  {
      value: function(){return options.userid || $.cookie('settingUserid');}
    },
    destination: {
      value: function(){return options.destination || Utils.getSearchVariable("destination");}
    },
    networkUserId: {
      value: function(){return options.networkUserId || Utils.getSearchVariable("networkUserId");}
    },
    hd: {
      value: function(){return Utils.getSearchVariable("hd") === "true" || $.cookie('settingHD');}
    },
    audioOnly: {
      value: function(){return Utils.getSearchVariable("audioOnly") === "true";}
    },
    sipDisplayName: {
      value: function(){
        var name = options.displayName || Utils.getSearchVariable("name") || $.cookie('settingDisplayName');
        if (name) {
          name = name.replace(/%20/g, " ");
        }
        return name;
      }
    },
    maxCallLength: {
      value: function(){return Utils.getSearchVariable("maxCallLength");}
    },
    size: {
      value: function(){return Utils.getSearchVariable("size") || $.cookie('settingsize') || 1;}
    },
    color: {
      value: function(){
        return Utils.colorNameToHex(Utils.getSearchVariable("color")) || $.cookie('settingColor') || '#ffffff';
      }
    },
    enableMessages: {
      value: function(){return !(!!Utils.getSearchVariable("disableMessages"));}
    },
    features: {
      value: function(){return Utils.getSearchVariable("features"); }
    }
  };

  Object.keys(options).forEach(function(key) {
    if(!(key in self.props)) {
      if(key === 'displayResolution') {
        self.props[key] = {
          value: function(){
            return options.displayResolution || $.cookie('settingsResolutionDisplay') || WebRTC_C.DEFAULT_RESOLUTION_DISPLAY;
          }
        }
      }
      else if(key === 'encodingResolution') {
        self.props[key] = {
          value: function(){
            return options.encodingResolution || $.cookie('settingsResolutionEncoding') || WebRTC_C.DEFAULT_RESOLUTION_ENCODING;
          }
        }
      } 
      else {
        self.props[key] = {
          value: function(){
            return options[key];
          }
        };
      }

      if(key.match(/bandwidth/)) {
        self.props[key].onSet = function(value){
          // console.log('----------- bandwidthChanged : ', value)
          eventbus.bandwidthChanged(self);
        }
      }
      else if(key.match(/resolution/i)) {
        self.props[key].onSet = function(value){
          // console.log('----------- resolutionChanged : ', value)
          eventbus.resolutionChanged(self);
        }
      }
    } 
  });

  self.init = function(options) { 
    // debug('configuration options : ' + ExSIP.Utils.toString(options));
    // debug('configuration : ' + ExSIP.Utils.toString(self));
    if (self.features) {
      self.setClientConfigFlags(parseInt(self.features, 10));
    }
  };

  self.listeners = function(audioOnly) { 
    eventbus.on('screenshare', function(e) {
      self.screenshare = e.enabled;
    });
    eventbus.on(["disconnected", "endCall", "ended", "failed"], function(e) {
      self.checkEndCallURL();
    });
  };

  self.checkEndCallURL = function() {
    if (self.endCallURL && !self.disabled) {
      window.location = self.endCallURL;
    }
  };

  self.setAudioOnlyOfferAndRec = function(audioOnly) { 
    self.audioOnly = audioOnly;
    offerToReceiveVideo = !audioOnly;
    sipstack.updateUserMedia();
  };

  self.setAudioOnly = function(audioOnly) { 
    self.audioOnly = audioOnly;
    offerToReceiveVideo = true;
    sipstack.updateUserMedia();
  };

  self.getClientConfigFlags = function() {
    var flags = 0;
    for (var flag in Flags) {
      var value = Flags[flag];
      if (self[flag]) {
        flags |= value;
      }
    }
    return flags;
  };
  self.setClientConfigFlags = function(flags) {
    for (var flag in Flags) {
      var value = Flags[flag];
      if (flags & value) {
        self[flag] = true;
      } else {
        self[flag] = false;
      }
    }
  };
  self.isAudioOnlyView = function() {
    var views = self.getViews();
    return views.indexOf('audioOnly') !== -1;
  };
  self.getViews = function() {
    var view = Utils.getSearchVariable("view");
    var views = [];
    if (self.view) {
      $.merge(views, self.view.split(' '));
    }
    if (view) {
      $.merge(views, view.split(' '));
    }
    return $.unique(views);
  };
  self.getBackgroundColor = function() {
    return self.color || $('body').css('backgroundColor');
  };
  self.getDTMFOptions = function() {
    return {
      duration: WebRTC_C.DEFAULT_DURATION,
      interToneGap: WebRTC_C.DEFAULT_INTER_TONE_GAP
    };
  };
  self.getExSIPOptions = function() {
    // Options Passed to ExSIP
    var options = {
      mediaConstraints: {
        audio: true,
        video: self.getVideoConstraints()
      },
      createOfferConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: !self.isAudioOnlyView() && offerToReceiveVideo
        }
      }
    };
    return options;
  };

  self.getMediaConstraints = function() {
    if (self.screenshare) {
      return {
        video: {
          mandatory: {
            chromeMediaSource: 'screen'
          }
        }
      };
    } else {
      return {
        audio: true,
        video: self.getVideoConstraints()
      };
    }
  };

  self.getVideoConstraints = function() {
    if (self.isAudioOnlyView() || self.audioOnly) {
      return false;
    } else {
      var constraints = self.getResolutionConstraints();
      return constraints ? constraints : true;
    }
  };

  self.resolutionEncodingWidth = function() {
    return Utils.resolutionWidth(self.encodingResolution);
  };
  self.resolutionEncodingHeight = function() {
    return Utils.resolutionHeight(self.encodingResolution);
  };

  self.getResolutionConstraints = function() {
    if (self.hd === true) {
      return {
        mandatory: {
          minWidth: 1280,
          minHeight: 720
        }
      };
    } else {
      var width = self.resolutionEncodingWidth();
      var height = self.resolutionEncodingHeight();
      if (width && height) {
        if (height <= 480) {
          return {
            mandatory: {
              maxWidth: width,
              maxHeight: height
            }
          };
        } else {
          return {
            mandatory: {
              minWidth: width,
              minHeight: height
            }
          };
        }
      } else {
        return false;
      }
    }
  };

  self.getExSIPConfig = function(data) {
    data = data || {};
    var userid = data.userId || self.userid || self.networkUserId || Utils.randomUserid();

    var sip_uri = encodeURI(userid);
    if ((sip_uri.indexOf("@") === -1)) {
      sip_uri = (sip_uri + "@" + self.domainFrom);
    }

    var config = {
      'uri': sip_uri,
      'authorization_user': data.authenticationUserId || $.cookie('settingAuthenticationUserId') || userid,
      'ws_servers': self.websocketsServers,
      'stun_servers': 'stun:' + self.stunServer + ':' + self.stunPort,
      'trace_sip': self.debug,
      'enable_ims': self.enableIms,
      'p_asserted_identity': self.pAssertedIdentity,
      'enable_datachannel': self.enableWhiteboard || self.enableFileShare
    };

    // Add Display Name if set
    if (self.sipDisplayName) {
      config.display_name = self.sipDisplayName;
    }

    // do registration if setting User ID or configuration register is set
    if (self.userid || self.register) {
      config.register = true;
      config.password = data.password || $.cookie('settingPassword');
    } else {
      config.register = false;
    }
    return config;
  };

  self.getBandwidth = function() {
    var height = self.resolutionEncodingHeight();
    if (height <= 240) {
      return self.bandwidthLow;
    } else if (height <= 480) {
      return self.bandwidthMed;
    } else if (height <= 720) {
      return self.bandwidthHigh;
    } else {
      console.error('getBandwidth : no encoding height matches : ', height);
    }
  };

  self.getRtcMediaHandlerOptions = function() {
    var options = {
      reuseLocalMedia: self.enableConnectLocalMedia,
      videoBandwidth: self.getBandwidth(),
      disableICE: self.disableICE,
      RTCConstraints: {
        'optional': [],
        'mandatory': {}
      }
    };
    return options;
  };

  self.isHD = function() {
    return self.enableHD === true && self.hd === true;
  };

  self.isWidescreen = function() {
    return self.isHD() || Utils.containsKey(WebRTC_C.WIDESCREEN_RESOLUTIONS, self.displayResolution);
  };

  self.getResolutionDisplay = function() {
    return self.isHD() ? WebRTC_C.R_1280x720 : self.displayResolution;
  }  

  return self;
}

