var C = {
    // RTCSession states
  VIEW_AUTHENTICATION: "authentication",
  VIEW_CALLCONTROL: "callcontrol",
  VIEW_HISTORY: "history",
  VIEW_TRANSFER: "transfer",
  VIEW_INCOMINGCALL: "incomingcall",
  VIEW_REINVITE: "reinvite",
  VIEW_SETTINGS: "settings",
  VIEW_SMS: "sms",
  VIEW_STATS: "stats",
  VIEW_VIDEO: "video",
  VIEW_WHITEBOARD: "whiteboard",
  VIEW_XMPP: "xmpp",
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
  HISTORY_PAGE_PREFIX: 'bdsft_client_page_',

  TEMPLATES: '$TEMPLATES$',

  CSS: '$CSS$',

  MEDIA: '$MEDIA$',

  FONTS: '$FONTS$',

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
C.DEFAULT_RESOLUTION_ENCODING = C.R_640x480;
C.DEFAULT_RESOLUTION_DISPLAY = C.R_640x480;
C.RESOLUTION_TYPES = {
  'standard': C.STANDARD,
  'widescreen': C.WIDESCREEN
};
C.STANDARD_RESOLUTIONS = {
  '960 x 720': C.R_960x720,
  '640 x 480': C.R_640x480,
  '320 x 240': C.R_320x240
};
C.WIDESCREEN_RESOLUTIONS = {
  '1280 x 720': C.R_1280x720,
  '640 x 360': C.R_640x360,
  '320 x 180': C.R_320x180
};

module.exports = C;