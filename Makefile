all: js/media.js node_modules/webrtc-core

include ./makefile.defs

## Create symlinks ##################################################################
node_modules/webrtc-core: 
	ln -sf ../ node_modules/webrtc-core
