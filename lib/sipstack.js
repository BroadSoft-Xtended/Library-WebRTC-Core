module.exports = require('./bdsft').Model(SIPStack, {
  config: require('../js/config')
});

var ExSIP = require('exsip');
var Constants = require('./constants');
var Utils = require('./utils');
var jQuery = $ = require('jquery');
require('jquery.cookie');

function SIPStack(eventbus, debug, urlconfig, cookieconfig) {
  var self = {};

  self.ua = null;
  self.activeSession = null;
  self.sessions = [];
  var screenshare = false;

  self.props = ['callState', 'registered', 'hd'];

  var checkEndCallURL = function() {
    if (self.endCallURL && self.enabled) {
      window.location = self.endCallURL;
    }
  };

  var getBandwidth = function() {
    var height = self.encodingResolutionHeight();
    if (height <= 240) {
      return self.bandwidthLow;
    } else if (height <= 480) {
      return self.bandwidthMed;
    } else if (height <= 720) {
      return self.bandwidthHigh;
    } else {
      debug('getBandwidth : no encoding height matches : ', height);
    }
  };

  var getMediaConstraints = function() {
    if (screenshare) {
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
        video: getVideoConstraints()
      };
    }
  };

  var getResolutionConstraints = function() {
    var width = self.encodingResolutionWidth();
    var height = self.encodingResolutionHeight();
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
  };

  var getVideoConstraints = function() {
    if (self.audioOnly) {
      return false;
    } else {
      var constraints = getResolutionConstraints();
      return constraints ? constraints : true;
    }
  };

  self.updateRtcMediaHandlerOptions = function() {
    if (!self.ua) {
      return;
    }
    self.ua.setRtcMediaHandlerOptions(self.getRtcMediaHandlerOptions());
  };

  self.updateUserMedia = function(value, userMediaCallback, failureCallback) {
    if (!self.ua) {
      return;
    }

    if (self.enabled && (self.enableConnectLocalMedia || self.activeSession)) {
      // Connect to local stream
      var options = self.getExSIPOptions();
      self.ua.getUserMedia(options, function(localStream) {
        eventbus.emit('userMediaUpdated', {localStream: localStream});
        if (self.activeSession) {
          debug("changing active session ...");
          self.activeSession.changeSession({
            localMedia: localStream,
            createOfferConstraints: options.createOfferConstraints
          }, function() {
            debug('change session succeeded');
          }, function() {
            debug('change session failed');
          });
        }

        if (userMediaCallback) {
          userMediaCallback(localStream);
        }
      }, function(e) {
        eventbus.getUserMediaFailed();
        if (failureCallback) {
          failureCallback(e);
        }
      }, true);
    }
  };

  self.bindings = {
    rtcMediaHandlerOptions: {
      sipstack: ['bandwidthLow', 'bandwidthMed', 'bandwidthHigh', 'encodingResolution']
    },
    userMedia: {
      sipstack: ['audioOnly', 'encodingResolution', 'enableConnectLocalMedia']
    },
    hd: {
      cookieconfig: 'hd',
      urlconfig: 'hd'
    },
    encodingResolution: {
      cookieconfig: 'encodingResolution'
    },
    enableAutoAnswer: {
      cookieconfig: 'enableAutoAnswer',
      urlconfig: 'enableAutoAnswer'
    }
  };

  var setActiveSession = function(session) {
    debug("setting active session to " + session.id);
    self.activeSession = session;
  };

  var updateRegistered = function() {
    self.registered = self.ua && self.ua.isRegistered();
  };

  var updateCallState = function() {
    if (self.sessions.length > 0) {
      if (self.sessions.length === 1 && !self.sessions[0].isStarted()) {
        self.callState = Constants.STATE_CALLING;
      } else {
        if (self.activeSession && self.activeSession.isHeld()) {
          self.callState = Constants.STATE_STARTED + " " + Constants.STATE_HELD;
        } else {
          self.callState = Constants.STATE_STARTED;
        }
      }
    } else {
      if (self.ua && self.ua.isConnected && self.ua.isConnected()) {
        self.callState = Constants.STATE_CONNECTED;
      } else {
        self.callState = Constants.STATE_DISCONNECTED;
      }
    }
  };

  self.endCall = function(options) {
    options = options || {};
    var rtcSession = options.rtcSession;
    if (rtcSession === 'all') {
      self.terminateSessions();
    } else if (rtcSession) {
      self.terminateSession(rtcSession);
    } else {
      self.terminateSession();
    }
  };
  self.getLocalStreams = function() {
    return self.activeSession ? self.activeSession.getLocalStreams() : null;
  };
  self.getRemoteStreams = function() {
    return self.activeSession ? self.activeSession.getRemoteStreams() : null;
  };
  self.getSessionId = function() {
    return self.activeSession.id.replace(/\./g, '');
  };
  self.terminateSession = function(session) {
    session = session || self.activeSession;
    if (!session) {
      return;
    }
    var index = self.sessions.indexOf(session);
    if (index !== -1) {
      self.sessions.splice(index, index + 1);
    }
    if (session.status !== ExSIP.RTCSession.C.STATUS_TERMINATED) {
      session.terminate();
    }
    if (session === self.activeSession) {
      debug("clearing active session");
      self.activeSession = null;
    }
    updateCallState();
  };
  self.terminateSessions = function() {
    var allSessions = [];
    allSessions = allSessions.concat(self.sessions);
    for (var i = 0; i < allSessions.length; i++) {
      self.terminateSession(allSessions[i]);
    }
  };
  self.holdAndAccept = function(session) {
    var firstSession = self.activeSession;
    session.on('ended', function() {
      eventbus.emit('message', {
        text: 'Resuming with ' + firstSession.remote_identity.uri.user,
        level: 'normal'
      });
      debug("incoming call ended - unholding first call");
      firstSession.unhold(function() {
        debug("unhold first call successful");
      });
    });
    self.activeSession.hold(function() {
      debug("hold successful - answering incoming call");
      self.answer(session);
    });
  };
  self.answer = function(session) {
    session.answer(self.getExSIPOptions());
  };
  self.hold = function(successCallback, failureCallback) {
    if (self.activeSession) {
      self.activeSession.hold(function() {
        eventbus.callHeld();
        successCallback && successCallback();
      }, function(e) {
        eventbus.callHeld(e);
        failureCallback && failureCallback();
      });
    }
  };
  self.unhold = function(successCallback, failureCallback) {
    if (self.activeSession) {
      self.activeSession.unhold(function() {
        eventbus.callResumed();
        successCallback && successCallback();
      }, function(e) {
        eventbus.callResumed(e);
        failureCallback && failureCallback();
      });
    }
  };
  self.reconnectUserMedia = function(successCallback, failureCallback) {
    var onUserMediaUpdateSuccess = function(localMedia) {
      debug("reconnect user media successful");
      if (self.activeSession) {
        self.activeSession.changeSession({
          localMedia: localMedia
        }, function() {
          debug("session changed successfully");
          if (successCallback) {
            successCallback(localMedia);
          }
        }, failureCallback);
      } else if (successCallback) {
        successCallback(localMedia);
      }
    };
    self.updateUserMedia(null, onUserMediaUpdateSuccess, failureCallback);
  };
  self.call = function(destination) {
    var session = self.ua.call(destination, self.getExSIPOptions());
    session.on('failed', function(e) {
      eventbus.emit('failed', e.data);
    });
    eventbus.calling(destination, session);
  };
  self.sendDTMF = function(digit) {
    self.activeSession.sendDTMF(digit, self.getDTMFOptions());
  };
  self.isStarted = function() {
    return self.getCallState() === Constants.STATE_STARTED;
  };
  self.unregister = function() {
    return self.ua && self.ua.unregister();
  };
  self.register = function() {
    return self.ua && self.ua.register();
  };
  self.isRegistered = function() {
    return self.registered;
  };
  self.sendData = function(data) {
    if (self.activeSession) {
      self.activeSession.sendData(data);
    }
  };
  self.transfer = function(transferTarget, isAttended) {
    if (isAttended) {
      self.ua.attendedTransfer(transferTarget, self.activeSession);
    } else {
      self.ua.transfer(transferTarget, self.activeSession);
    }
  };
  self.getCallState = function() {
    return self.callState;
  }

  // Incoming reinvite function
  self.incomingReInvite = function(e) {
    debug("auto accepting reInvite");
    e.data.session.acceptReInvite();
  };

  self.incomingCall = function(evt) {
    var session = evt.data.session;
    if (!self.activeSession && self.enableAutoAnswer) {
      session.answer(self.getExSIPOptions());
    } else {
      eventbus.emit('incomingCall', evt);
    }
  };

  self.getExSIPOptions = function() {
    // Options Passed to ExSIP
    var options = {
      mediaConstraints: getMediaConstraints(),
      createOfferConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: self.offerToReceiveVideo
        }
      }
    };
    return options;
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

  self.encodingResolutionWidth = function() {
    return Utils.resolutionWidth(self.hd && Constants.R_1280x720 || self.encodingResolution);
  };

  self.encodingResolutionHeight = function() {
    return Utils.resolutionHeight(self.hd && Constants.R_1280x720 || self.encodingResolution);
  };

  self.getExSIPConfig = function(data) {
    data = data || {};
    var userid = data.userId || cookieconfig.userid || self.networkUserId || Utils.randomUserid();

    var sip_uri = encodeURI(userid);
    if ((sip_uri.indexOf("@") === -1)) {
      sip_uri = (sip_uri + "@" + self.domainFrom);
    }

    var config = {
      'uri': sip_uri,
      'authorization_user': data.authenticationUserId || cookieconfig.authenticationUserid || userid,
      'ws_servers': self.websocketsServers,
      'stun_servers': 'stun:' + self.stunServer + ':' + self.stunPort,
      'trace_sip': self.debug,
      'enable_ims': self.enableIms,
      'enable_datachannel': self.enableWhiteboard || self.enableFileShare
    };

    // Add Display Name if set
    if (cookieconfig.displayName) {
      config.display_name = cookieconfig.displayName;
    }

    // do registration if User ID or register is set
    if (cookieconfig.userid || self.register) {
      config.register = true;
      config.password = data.password || cookieconfig.password;
    } else {
       // only set PAI if user is not registered
      config.p_asserted_identity = self.pAssertedIdentity;
      config.register = false;
    }
    return config;
  };

  self.getRtcMediaHandlerOptions = function() {
    var options = {
      reuseLocalMedia: self.enableConnectLocalMedia,
      videoBandwidth: getBandwidth(),
      disableICE: self.disableICE,
      RTCConstraints: {
        'optional': [],
        'mandatory': {}
      }
    };
    return options;
  };

  self.getDTMFOptions = function() {
    return {
      duration: Constants.DEFAULT_DURATION,
      interToneGap: Constants.DEFAULT_INTER_TONE_GAP
    };
  };

  self.listeners = function(databinder) {
    databinder.onModelPropChange('websocketsServers', function(){
      if(self.ua) {
        self.initUA();
      }
    });
    window.onbeforeunload = function(e) {
      self.endCall({
        rtcSession: 'all'
      });
      return null;
    };
    eventbus.on(["disconnected", "endCall", "ended", "failed"], function(e) {
      checkEndCallURL();
    });
    eventbus.on('screenshare', function(e) {
      screenshare = e.enabled;
    });
    eventbus.on(["disconnected"], function(e) {
      self.endCall({
        rtcSession: 'all'
      });
    });
    eventbus.on("holdCall", function(e) {
      self.hold();
    });
    eventbus.on("resumeCall", function(e) {
      self.unhold();
    });
    eventbus.on("screenshareFailure", function(e) {
      self.reconnectUserMedia();
    });
    eventbus.on("screenshare", function(e) {
      if (e.enabled) {
        var onShareScreenSuccess = function(localMedia) {
          localMedia.onended = function() {
            eventbus.screenshare(false);
          };
        };
        var onShareScreenFailure = function(e) {
          eventbus.screenshareFailure(e);
        };
        self.reconnectUserMedia(onShareScreenSuccess, onShareScreenFailure);
      } else {
        self.reconnectUserMedia();
      }
    });
    eventbus.on(["ended", "failed", "endCall"], function(e) {
      self.endCall({
        rtcSession: e.sender
      });
    });
    eventbus.on("signOut", function(e) {
      self.unregister();
      eventbus.once('unregistered', function() {
        self.initUA();
      });
    });
    eventbus.on("signIn", function(e) {
      self.initUA();
    });
    eventbus.on("connected", function(e) {
      self.updateUserMedia();
    });
    eventbus.on("resumed", function(e) {
      setActiveSession(e.sender);
    });
    eventbus.on("started", function(e) {
      setActiveSession(e.sender);
    });
    var dtmfTones = Utils.parseDTMFTones(urlconfig.destination);
    if(dtmfTones) {
      eventbus.once("started", function(e) {
        debug("DTMF tones found in destination - sending DTMF tones : " + dtmfTones);
        self.sendDTMF(dtmfTones);
      });
    }
    eventbus.on('authenticate', function(e) {
      self.initUA(e);
    });
  };

  self.init = function() {
    self.enableIms = urlconfig.enableIms || self.enableIms;
    self.enableConnectLocalMedia = urlconfig.enableConnectLocalMedia || self.enableConnectLocalMedia;
    self.audioOnly = urlconfig.audioOnly || urlconfig.audioOnlyView || self.audioOnly;
    if(urlconfig.audioOnlyView) {
      self.offerToReceiveVideo = false;
    }

    self.initUA();
  };

  self.initUA = function(data) {
    try {
      if (self.ua) {
        debug('stopping existing UA');
        self.ua.stop();
      }

      if (!self.enabled) {
        debug('sipstack disabled');
        return;
      }
      self.ua = new ExSIP.UA(self.getExSIPConfig(data));

      self.updateRtcMediaHandlerOptions();

      // Start SIP Stack
      self.ua.start();

      // sipStack callbacks
      self.ua.on('connected', function(e) {
        updateCallState();
        eventbus.emit('connected', e);
      });
      self.ua.on('disconnected', function(e) {
        updateCallState();
        eventbus.emit('disconnected', e);
      });
      self.ua.on('onReInvite', function(e) {
        debug("incoming onReInvite event");
        self.incomingReInvite(e);
      });
      self.ua.on('newRTCSession', function(e) {
        var session = e.data.session;
        self.sessions.push(session);
        updateCallState();

        // call event handlers
        session.on('progress', function(e) {
          eventbus.emit('progress', e);
        });
        session.on('failed', function(e) {
          var data = e.data;
          data.sender = e.sender;
          eventbus.emit('failed', data);
          if (data.cause === ExSIP.C.causes.CANCELED) {
            eventbus.canceled();
          }
        });
        session.on('started', function(e) {
          updateCallState();
          eventbus.emit('started', e);
        });
        session.on('resumed', function(e) {
          updateCallState();
          eventbus.emit('resumed', e);
        });
        session.on('held', function(e) {
          updateCallState();
          eventbus.emit('held', e);
        });
        session.on('ended', function(e) {
          updateCallState();
          eventbus.emit('ended', e);
        });
        session.on('newDTMF', function(e) {
          eventbus.emit('newDTMF', e);
        });
        session.on('dataSent', function(e) {
          eventbus.emit('dataSent', e);
        });
        session.on('dataReceived', function(e) {
          eventbus.emit('dataReceived', e);
        });
        session.on('iceconnected', function(e) {
          eventbus.iceconnected(e.sender, e.data);
        });
        session.on('icecompleted', function(e) {
          eventbus.icecompleted(e.sender, e.data);
        });
        session.on('iceclosed', function(e) {
          eventbus.iceclosed(e.sender, e.data);
        });

        // handle incoming call
        if (e.data.session.direction === "incoming") {
          self.incomingCall(e);
        } else {
          if (!self.activeSession) {
            debug('new active session : ' + session.id);
            self.activeSession = session;
          }
        }
      });

      self.ua.on('registered', function() {
        updateRegistered();
        eventbus.emit('registered');
      });
      self.ua.on('unregistered', function() {
        updateRegistered();
        eventbus.emit('unregistered');
      });
      self.ua.on('registrationFailed', function(e) {
        updateRegistered();
        eventbus.emit('registrationFailed', e);
      });
    } catch (e) {
      console.error(e.stack);
      debug('could not init sip stack');
    }
  };

  return self;
}