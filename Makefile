# See the README for installation instructions.

UGLIFY = node_modules/.bin/uglifyjs
SMASH = node_modules/.bin/smash


GENERATED_FILES = \
	d3.latest.js \
	d3.js \
	d3.min.js \
	bower.json \
	component.json

all: $(GENERATED_FILES)

.PHONY: superclean clean all test benchmark

npm-install:
	npm install
	-@touch npm-install

test:
	@npm test

src/start.js: npm-install package.json bin/start
	bin/start > $@

test/data/sample-big.csv:
	echo 'a,b,c,d,e,f,g,h,i,j' > $@
	for i in {1..100000}; do echo '0,1,2,3,4,5,6,7,8,9' >> $@; done

d3.latest.js: $(SMASH) $(shell $(SMASH) --ignore-missing --list src/d3.js) package.json
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
	@touch bin/locale

superclean: clean
	-find . -type d -name 'node_modules' -exec rm -rf "{}" \;
