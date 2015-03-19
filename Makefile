SHELL := /bin/bash

MEDIA_FILES := $(shell glob-cli "media/**/*")

all: media node_modules/webrtc-core
media: node_modules/bdsft-webrtc-media

## Create symlinks ##################################################################
node_modules/bdsft-webrtc-media: js/media.js
	ln -sf ../js/media.js node_modules/bdsft-webrtc-media

node_modules/webrtc-core: 
	ln -sf ../ node_modules/webrtc-core

## Compile styles ##################################################################
js/media.js: $(MEDIA_FILES)
	scripts/encode-media media js/media.js
