SHELL := /bin/bash

MEDIA_FILES := $(shell glob-cli "media/**/*")

all: node_modules/bdsft-webrtc-media

## Create symlinks ##################################################################
node_modules/bdsft-webrtc-media: js/media.js
	ln -sf ../js/media.js node_modules/bdsft-webrtc-media

## Compile styles ##################################################################
js/media.js: $(MEDIA_FILES)
	scripts/encode-media media js/media.js