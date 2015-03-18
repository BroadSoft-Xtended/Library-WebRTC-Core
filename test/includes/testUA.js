var ExSIP = require('../../lib/app').exsip;

module.exports = {
  createModelAndView: function(name, lib) {
    this.create(name, {lib: lib, constructor: lib.model});
    this.create(name+'view', {lib: lib, constructor: lib.view});
  },
  createCore: function(name) {
    this.create(name, {constructor: require('../..')[name]});
  },
  create: function(name, createOptions) {
    createOptions = createOptions || {};
    var properties = {};
    var id = 'test'
    var instancesObj = 'bdsft_client_instances';
    properties[name] = {
      get: function() {
        return global[instancesObj][name+'_'+id];
      }
    };
    Object.defineProperties(global, properties);

    var options = {id: id, instancesObj: instancesOb, require('../../')};
    var core = require('../../lib/app');
    options.dependencies = {
        core: core
    };
    if(createOptions.lib) {
      options.dependencies[name.replace(/view/i, '')] = createOptions.lib;
    }
    core.factory(options)(createOptions.constructor);
  },
  create: function(name) {
    var properties = {};
    var id = 'test'
    var instancesObj = 'bdsft_client_instances';
    properties[name] = {
      get: function() {
        return global.[instancesObj].[name+'_'+id];
      }
    };
    properties[name+'view'] = {
      get: function() {
        return global.[instancesObj].[name+'view_'+id];
      }
    };
    Object.defineProperties(global, properties);

    var view = require("views/"+name);
    var model = require("models/"+name);
    options.dependencies = {
        id: id,
        instancesObj: instancesObj,
        core: require('../../lib/app'),
        authenticationView: view,
        authentication: model
    };
    core.factory(options)(view);
    core.factory(options)(model);
  },
  isVisible: function(element, visible) {
    // fix caching bug with jsdom and css() by calling _clearMemoizedQueries();
    element[0]._clearMemoizedQueries();
    var isPopup = element.attr('class').indexOf('popup') !== -1;
    expect(element.css('opacity')).toEqual(visible ? "1" : "0");
    expect(element.css('zIndex')).toEqual(visible ? (isPopup ? "100" : "20") : "-1");
  },

  deleteAllCookies: function() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  },

  emitReInvite: function() {
    sipstack.ua.emit("onReInvite", sipstack.ua, {
      session: {
        acceptReInvite: function() {
          reInviteAccepted = true;
        },
        rejectReInvite: function() {
          reInviteRejected = true;
        }
      },
      request: {
        from: {
          displayName: "test",
          uri: {
            user: "user"
          }
        }
      },
      audioAdd: true,
      videoAdd: true
    });
  },

  connectAndStartCall: function() {
    this.connect();
    this.startCall();
  },

  connect: function() {
    sipstack.ua.isConnected = function() {
      return true;
    };
    sipstack.ua.emit('connected', sipstack.ua);
  },

  val: function(element, value) {
    element.val(value);
    element.trigger('change');
  },

  check: function(element, value) {
    element.prop('checked', value);
    element.trigger('change');
  },

  disconnect: function(data) {
    sipstack.ua.isConnected = function() {
      return false;
    };
    sipstack.ua.emit('disconnected', sipstack.ua, data);
  },

  registrationFailed: function(statusCode) {
    sipstack.ua.emit('registrationFailed', sipstack.ua, {
      response: {
        status_code: (statusCode || 401)
      }
    });
  },

  registered: function() {
    sipstack.ua.emit('registered', sipstack.ua, {
      response: {
        status_code: 200
      }
    });
  },

  endCall: function() {
    sipstack.activeSession.status = ExSIP.RTCSession.C.STATUS_TERMINATED;
    sipstack.activeSession.emit('ended', sipstack.activeSession);
  },

  startCall: function(session) {
    session = session || this.outgoingSession();
    sipstack.ua.emit('newRTCSession', sipstack.ua, {
      session: session
    });
    session.started('local');
    return session;
  },

  reconnectCall: function(session) {
    session = session || this.outgoingSession();
    session.started('local', undefined, true);
  },

  newCall: function(session) {
    session = session || this.outgoingSession();
    sipstack.ua.emit('newRTCSession', sipstack.ua, {
      session: session
    });
  },

  failCall: function(session) {
    session = session || this.outgoingSession();
    sipstack.ua.emit('newRTCSession', sipstack.ua, {
      session: session
    });
    session.failed('local', 'somemessage', 'somecause');
  },

  outgoingSession: function(option) {
    option = option || {};
    var session = this.createSession();
    session.id = option.id || "someid";
    session.remote_identity = {
      uri: "remoteuri"
    };
    return session;
  },

  incomingSession: function() {
    var session = this.createSession();
    session.id = "incomingid";
    session.direction = "incoming";
    session.status = ExSIP.RTCSession.C.STATUS_WAITING_FOR_ANSWER;
    session.remote_identity = {
      uri: "incoming_remote_uri"
    };
    return session;
  },

  createSession: function() {
    var session = new ExSIP.RTCSession(sipstack.ua);
    session.hold = function(success) {
      session.held();
      if (success) {
        success();
      }
    }
    session.unhold = function(success) {
      session.resumed();
      if (success) {
        success();
      }
    }
    session.terminate = function(options) {
      session.ended('local');
    }
    session.answer = function(options) {
      answerOptions = options;
      session.started('local');
    }
    session.changeSession = function(options, success) {
      session.started('local');
      success();
    }
    return session;
  },

  incomingCall: function(session) {
    session = session || this.incomingSession();
    var request = {
      to_tag: "1234567",
      from_tag: "7654321",
      from: {
        display_name: "Incoming DisplayName",
        uri: {
          user: "Incoming User"
        }
      }
    };
    sipstack.ua.emit('newRTCSession', sipstack.ua, {
      session: session,
      request: request
    });
  },

  createLocalMedia: function() {
    return {
      stop: function() {},
      getAudioTracks: function() {
        return [{}];
      }
    };
  },

  mockWebRTC: function() {
    var self = this;
    ExSIP.WebRTC.RTCPeerConnection = function() {
      return {
        localDescription: null,
        remoteDescription: null,
        createDTMFSender: function() {
          return {}
        },
        close: function() {},
        setRemoteDescription: function(description, success, failure) {
          this.remoteDescription = description;
          if (success) {
            success();
          }
        },
        addStream: function() {},
        createOffer: function(success) {
          success(new ExSIP.WebRTC.RTCSessionDescription());
        },
        createAnswer: function(success) {
          success(new ExSIP.WebRTC.RTCSessionDescription());
        },
        setLocalDescription: function(description) {
          this.localDescription = description;
        }
      }
    };
    ExSIP.WebRTC.getUserMedia = function(constraints, success, failure) {
      success(self.createLocalMedia());
    };
    ExSIP.WebRTC.isSupported = true;
    ExSIP.UA.prototype.recoverTransport = function() {
    }
  }
}