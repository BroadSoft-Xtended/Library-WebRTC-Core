all: js/styles.js

## Compile styles ##################################################################
styles/css:
	node_modules/stylus/bin/stylus --import node_modules/bdsft-sdk-view/styles/components/variables -u stylus-font-face --with {limit:20000} --include-css styles/*.styl -o styles

js/styles.js: styles/css
	mkdir -p js/ && node_modules/bdsft-sdk-view/scripts/export-style styles js/styles.js
