# See the README for installation instructions.

SMASH = node_modules/.bin/smash
UGLIFY = node_modules/uglify-js/bin/uglifyjs

GENERATED_FILES = \
	d3.latest.js \
	d3.js \
	d3.min.js \
	component.json \
	package.js

all: $(GENERATED_FILES)

.PHONY: superclean clean all test benchmark publish lint __prepublish __postpublish pre-publish post-publish

npm-install:
	-@touch npm-install
	npm install

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
	$(UGLIFY) $< -b -o $@
	@chmod a-w $@

d3.min.js: d3.js
	@rm -f $@
	$(UGLIFY) d3.js > $@

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

pre-publish: package.js d3.js
	# __prepublish

__prepublish:
	npm test
	rm -f package.js src/start.js d3.js d3.min.js d3.zip
	bin/start > src/start.js
	bin/meteor > package.js
	smash src/d3.js > tmp-d3.js
	$(UGLIFY) tmp-d3.js -b -o d3.js
	$(UGLIFY) d3.js > d3.min.js
	chmod a-w d3.js d3.min.js package.js
	#rm -f tmp-d3.js
	zip d3.zip LICENSE d3.js d3.min.js

post-publish:
	# __postpublish

__postpublish:
	git push
	git push --tags
	cp -v README.md LICENSE d3.js d3.min.js ../d3-bower
	cd ../d3-bower
	git add README.md LICENSE d3.js d3.min.js
	VERSION=`node -e 'console.log(require(\"./package.json\").version)'`; git commit -m \"Release $VERSION.\"
	VERSION=`node -e 'console.log(require(\"./package.json\").version)'`; git tag -am \"Release $VERSION.\" v${VERSION}
	git push
	git push --tags
	cd -
	cp -v d3.js ../d3.github.com/d3.v3.js
	cp -v d3.min.js ../d3.github.com/d3.v3.min.js
	cd ../d3.github.com
	git add d3.v3.js d3.v3.min.js
	VERSION=`node -e 'console.log(require(\"./package.json\").version)'`; git commit -m \"d3 ${VERSION}\"
	git push

$(SMASH): npm-install

# When you nuke the generated files, smash crashes and does not recover. The 'echo x' and 'touch' lines are a hotfix for that one as it takes too long to fix in smash itself.
clean:
	-rm -f -- $(GENERATED_FILES)
	-rm -f npm-install
	@touch bin/locale

superclean: clean
	-find . -type d -name 'node_modules' -exec rm -rf "{}" \;

