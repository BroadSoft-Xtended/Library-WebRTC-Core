module.exports = {
	sipstack: {
		enabled: true,
	    enableConnectLocalMedia: true,
	    enableIms: false,
	    enableAutoAnswer: false,
	    enableDatachannel: false,
		encodingResolution: '640x480',
	    websocketsServers: [{'ws_uri':'wss://webrtc-gw.broadsoftlabs.com:8443', 'weight':0}],
	    stunServer: 'stun.broadsoftlabs.com',
		stunPort: 3478,
		domainFrom: 'broadsoftlabs.com',
	    bandwidthLow: 128,
	    bandwidthMed: 512,
	    bandwidthHigh: 2048,
	    pAssertedIdentity: '<sip:webguest@broadsoftlabs.com>',
	    disableICE: true,
	    audioOnly: false,
	    offerToReceiveVideo: true,
	    networkUserId: false,
	    debug: false
	},
	sound: {
	    volumeClick: 1,
	    volumeDTMF: 1,
	    volumeRingtone: 1
	},
	fullscreen: {
		enableFullscreen: true
	},
	screenshare: {
		enableScreenshare: false
	},
	debug: {
		names: '*',
		level: 'debug'
	}
}
