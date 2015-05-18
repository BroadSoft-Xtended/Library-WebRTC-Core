all: js/media.js js/styles.js

include ./makefile.defs

## Compile styles ##################################################################
styles/css: $(STYLUS_FILES)
	node_modules/stylus/bin/stylus --import styles/variables -u stylus-font-face --with {limit:20000} --include-css styles/styles.styl -o styles

js/styles.js: styles/min.css
	mkdir -p js/ && scripts/export-style styles/styles.min.css js/styles.js

