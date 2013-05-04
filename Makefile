# See the README for installation instructions.

NODE_PATH ?= ./node_modules
SMASH = $(NODE_PATH)/smash/smash
JS_COMPILER = $(NODE_PATH)/uglify-js/bin/uglifyjs
JS_TESTER = $(NODE_PATH)/vows/bin/vows
JS_DOCCO = $(NODE_PATH)/docco/bin/docco
PACKAGE_JSON = package.json
LOCALE ?= en_US

GENERATED_FILES = \
	d3.js \
	d3.latest.js \
	d3.min.js \
	component.json

all: $(GENERATED_FILES)

.PHONY: clean all test benchmark docco

test:
	@npm test

benchmark: all
	@node test/geo/benchmark.js

docco:  $(shell $(SMASH) --list src/d3.js)
ifneq ($(wildcard $(JS_DOCCO)),)		# when node or any of these tools has not been installed, ignore them.
	$(JS_DOCCO) $(filter %.js,$<)
endif

src/time/format-localized.js: src/locale.js src/time/format-locale.js
	LC_TIME=$(LOCALE) locale -ck LC_TIME | node src/locale.js src/time/format-locale.js > $@

d3.latest.js: $(shell $(SMASH) --list src/d3.js)
	@rm -f $@
	$(SMASH) src/d3.js | sed 's/[[:<:]]VERSION[[:>:]]/"$(shell ./version)"/' > $@
	@chmod a-w $@

d3.js: d3.latest.js
	@rm -f $@
	$(JS_COMPILER) $< -b indent-level=2 -o $@
	@chmod a-w $@

d3.min.js: d3.js
	@rm -f $@
	$(JS_COMPILER) $< -c -m -o $@
	@chmod a-w $@

component.json: src/component.js d3.js
	@rm -f $@
	node src/component.js > $@
	@chmod a-w $@

#package.json: src/package.js d3.js
#	@rm -f $@
#	node src/package.js > $@
#	@chmod a-w $@

clean:
	rm -f -- $(GENERATED_FILES)






