SHELL := /bin/bash

MEDIA_FILES := $(shell glob-cli "media/**/*")

all: js/bdsft-webrtc-media.js node_modules/webrtc-core symlinks
symlinks: node_modules/bdsft-webrtc-media

## Create symlinks ##################################################################
node_modules/webrtc-core: 
	ln -sf ../ node_modules/webrtc-core

node_modules/bdsft-webrtc-media:
	ln -sf ../js/bdsft-webrtc-media.js node_modules/bdsft-webrtc-media

## Compile styles ##################################################################
js/bdsft-webrtc-media.js: $(MEDIA_FILES)
	scripts/encode-media media js/bdsft-webrtc-media.js
