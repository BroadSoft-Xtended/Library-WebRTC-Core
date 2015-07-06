all: js/media.js js/styles.js

js/media.js: $(MEDIA_FILES)
	mkdir -p js/ && scripts/encode-base64 media js/media.js

## Compile styles ##################################################################
styles/css: $(STYLUS_FILES)
	node_modules/stylus/bin/stylus --import styles/components/variables -u stylus-font-face --with {limit:20000} --include-css styles/*.styl -o styles

js/styles.js: styles/css
	mkdir -p js/ && scripts/export-style styles js/styles.js
