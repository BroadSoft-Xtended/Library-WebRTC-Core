SHELL := /bin/bash
PATH := node_modules/.bin:$(PATH)

JS_FILES := $(shell glob-cli "lib/**/*.js")


all: build

build: webrtc-core.js



## Build browserified files #######################################################
TRANSFORMS := -t brfs

### Without script tag loader
webrtc-core.js: webrtc-core.dev.js
	uglifyjs $< > build/$@

webrtc-core.dev.js: $(JS_FILES)
	browserify $(TRANSFORMS) lib/app.js > build/$@
