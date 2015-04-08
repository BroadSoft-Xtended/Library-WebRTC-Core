SHELL := /bin/bash

MEDIA_FILES := $(shell glob-cli "media/**/*")

all: media node_modules/webrtc-core
media: node_modules/bdsft-webrtc-media

## Create symlinks ##################################################################
node_modules/webrtc-core: 
	ln -sf ../ node_modules/webrtc-core

## Compile styles ##################################################################
node_modules/bdsft-webrtc-media: $(MEDIA_FILES)
	scripts/encode-media media node_modules/bdsft-webrtc-media
