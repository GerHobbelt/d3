# See the README for installation instructions.

SMASH = node_modules/.bin/smash

GENERATED_FILES = \
	d3.latest.js \
	d3.js \
	d3.min.js \
	component.json \
	package.js

all: $(GENERATED_FILES)

.PHONY: superclean clean all test benchmark publish lint

npm-install:
	npm install
	-@touch npm-install

test: npm-install
	@npm test

lint-all: npm-install
	jshint $(shell $(SMASH) --ignore-missing --list src/d3.js) 

lint: npm-install d3.latest.js
	jshint d3.latest.js 

src/start.js: npm-install package.json bin/start
	bin/start > $@

d3.zip: LICENSE d3.js d3.min.js
	zip $@ $^

test/data/sample-big.csv:
	echo 'a,b,c,d,e,f,g,h,i,j' > $@
	for i in {1..100000}; do echo '0,1,2,3,4,5,6,7,8,9' >> $@; done

# dependency `$(shell $(SMASH) --ignore-missing --list src/d3.js)` does not fly with my Win8/64 make v4.1 :-(( 
d3.latest.js: $(SMASH) src/*.js src/*/*.js src/*/*/*.js package.json
	@rm -f $@
	$(SMASH) src/d3.js > $@
	@chmod a-w $@

d3.js: d3.latest.js
	@rm -f $@
	cat d3.latest.js | uglifyjs - -b indent-level=2 -o $@
	@chmod a-w $@

d3.min.js: d3.js
	@rm -f $@
	uglifyjs d3.js > $@

%.json: npm-install bin/% package.json
	@rm -f $@
	bin/$* > $@
	@chmod a-w $@

package.js: npm-install bin/meteor package.json
	@rm -f $@
	bin/meteor > package.js
	@chmod a-w $@

publish: npm-install
	npm publish
	meteor publish && rm -- .versions

$(SMASH): npm-install

# When you nuke the generated files, smash crashes and does not recover. The 'echo x' and 'touch' lines are a hotfix for that one as it takes too long to fix in smash itself.
clean:
	-rm -f -- $(GENERATED_FILES)
	-rm -f npm-install
	@touch bin/locale

superclean: clean
	-find . -type d -name 'node_modules' -exec rm -rf "{}" \;

