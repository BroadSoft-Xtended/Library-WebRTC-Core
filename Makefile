all: node_modules/webrtc-core js/media.js js/styles.js

include ./makefile.defs

## Create symlinks ##################################################################
node_modules/webrtc-core: 
	ln -sf ../ node_modules/webrtc-core
