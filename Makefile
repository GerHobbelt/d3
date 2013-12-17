LOCALE ?= en_US

UGLIFY = node_modules/.bin/uglifyjs
SMASH = node_modules/.bin/smash

GENERATED_FILES = \
	d3.latest.js \
	d3.js \
	d3.min.js \
	src/format/format-localized.js \
	src/time/format-localized.js \
	bower.json \
	component.json

all: $(GENERATED_FILES)

.PHONY: clean all test benchmark

test:
	@npm test

src/format/format-localized.js: bin/locale src/format/format-locale.js
	LC_NUMERIC=$(LOCALE) LC_MONETARY=$(LOCALE) locale -ck LC_NUMERIC LC_MONETARY | bin/locale src/format/format-locale.js > $@

src/time/format-localized.js: bin/locale src/time/format-locale.js
	LC_TIME=$(LOCALE) locale -ck LC_TIME | bin/locale src/time/format-locale.js > $@

src/start.js: package.json bin/start
	bin/start > $@

d3.latest.js: $(shell $(SMASH) --list src/d3.js) package.json src/format/format-localized.js src/time/format-localized.js
	@rm -f $@
	$(SMASH) src/d3.js > $@
	@chmod a-w $@

d3.js: d3.latest.js
	@rm -f $@
	cat $< | $(UGLIFY) - -b indent-level=2 -o $@
	@chmod a-w $@

d3.min.js: d3.js bin/uglify
	@rm -f $@
	bin/uglify $< > $@

%.json: bin/% package.json
	@rm -f $@
	bin/$* > $@
	@chmod a-w $@

# When you nuke the generated files, smash crashes and does not recover. The 'echo x' and 'touch' lines are a hotfix for that one as it takes too long to fix in smash itself.
clean:
	-rm -f -- $(GENERATED_FILES)
	@echo x!y > src/format/format-localized.js
	@echo x!y > src/time/format-localized.js
	@touch bin/locale
