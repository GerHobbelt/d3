LOCALE_ENV ?= en_US.UTF-8

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

.PHONY: superclean clean all test benchmark 

npm-install: 
	npm install
	-@touch npm-install 

test:
	@npm test

src/format/format-localized.js: npm-install bin/locale src/format/format-locale.js
	LC_ALL=$(LOCALE_ENV) LC_NUMERIC=$(LOCALE_ENV) LC_MONETARY=$(LOCALE_ENV) locale -ck LC_NUMERIC LC_MONETARY | bin/locale src/format/format-locale.js > $@

src/time/format-localized.js: npm-install bin/locale src/time/format-locale.js
	LC_ALL=$(LOCALE_ENV) LC_TIME=$(LOCALE_ENV) locale -ck LC_TIME | bin/locale src/time/format-locale.js > $@

src/start.js: npm-install package.json bin/start
	bin/start > $@

d3.latest.js: $(SMASH) $(shell $(SMASH) --ignore-missing --list src/d3.js) package.json src/format/format-localized.js src/time/format-localized.js
	@rm -f $@
	$(SMASH) src/d3.js > $@
	@chmod a-w $@

d3.js: $(UGLIFY) d3.latest.js
	@rm -f $@
	cat d3.latest.js | $(UGLIFY) - -b indent-level=2 -o $@
	@chmod a-w $@

d3.min.js: npm-install d3.js bin/uglify
	@rm -f $@
	bin/uglify d3.js > $@

%.json: npm-install bin/% package.json
	@rm -f $@
	bin/$* > $@
	@chmod a-w $@

$(SMASH): npm-install

$(UGLIFY): npm-install
	
# When you nuke the generated files, smash crashes and does not recover. The 'echo x' and 'touch' lines are a hotfix for that one as it takes too long to fix in smash itself.
clean:
	-rm -f -- $(GENERATED_FILES)
	-rm -f npm-install
	@echo x!y > src/format/format-localized.js
	@echo x!y > src/time/format-localized.js
	@touch bin/locale

superclean: clean
	-find . -type d -name 'node_modules' -exec rm -rf "{}" \;
