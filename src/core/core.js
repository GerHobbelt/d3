//This is the humble beginnings of the d3 object. As other .js files are added, they will have functions which take d3 and extend it bit by bit. 

//d3 follows a semantic versioning scheme. 
//More info can be found at [semver.org](http://semver.org).
// 
//What does this really mean though?
// 
//Parse 2.9.2 as X.Y.Z for a moment
// 
//X, the major version number, being 2 means that if your code depends on 0.X.Y or 1.X.Y, the code will most likely not work out of the box. Significant changes have been made that incremented the major number. Note that each time X increments, the value of Y and Z get reset to 0. 
// 
//Y, the minor version, being 9 indicates that there have been 9 minor version changes of the code created while X is 2. The public API will not be broken and there is a good chance that your old code, say 2.8.2, will just work out of the box. When Y is incremented, Z, the patch version, goes to 0 while the major version number is left unchanged. 
// 
//Z, the patch version, being 2 indicates that since d3 has been on version 2.9.0, there have been 2 patches applied. This means that the only changes have been fixes to backwards-compatible bugs.
//
//Seriously, read [semver.org](http://semver.org). It does an excellent job of outlining what exactly mbostock has promised to provide and why he should (hint: fully public documentation of the API). 
d3 = {version: "2.9.2"}; // semver

//Next: [core/class.js](/d3/src/core/class.html)