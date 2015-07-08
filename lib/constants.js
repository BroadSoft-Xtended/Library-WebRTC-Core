var C = {
    // RTCSession states
  STATE_CONNECTED: "connected",
  STATE_DISCONNECTED: "disconnected",
  STATE_CALLING: "calling",
  STATE_STARTED: "started",
  STATE_HELD: "held",
  
  WIDESCREEN: 'widescreen',
  STANDARD: 'standard',
  R_1280x720: '1280x720',
  R_640x360: '640x360',
  R_320x180: '320x180',
  R_960x720: '960x720',
  R_640x480: '640x480',
  R_320x240: '320x240',
  DEFAULT_DURATION: 500,
  DEFAULT_INTER_TONE_GAP: 200,
  EXPIRES: 365,

  STYLES: {
    iconHightlightColor: '#00adef',
    infoMessageColor: '#999999',
    successMessageColor: '#00FF00',
    warningMessageColor: '#FFFF00',
    alertMessageColor: '#FF0000',
    statsColor: '#999999',
    timerColor: '#FFFFFF'
  }

};

module.exports = C;