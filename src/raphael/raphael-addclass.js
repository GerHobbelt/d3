if(typeof Raphael !== "undefined") {
    // Inspiration (and code copied): http://strongriley.github.com/d3/ex/calendar.html (-ewebb 120430)

    // Originally from: http://www.hunlock.com/blogs/Totally_Pwn_CSS_with_Javascript#quickIDX1
    // Note that this won't handle anything except exact rule matches, and only the first instance
    // of said rule match.

    // clint.tseng@socrata.com 2012/06/01
    // IE perf is dreadful when fetching stylesheets and rules. We need to cache the results or
    // we'll never get things done in anything resembling expediency. Unfortunately this means that
    // anybody writing dynamic styles are out of luck. On the other hand, this is a pretty flimsy
    // implementation anyway.

    var ruleCache = {};
    function d3_raphael_getCSSRule(ruleName) {
        ruleName = ruleName.toLowerCase();
        if (ruleCache[ruleName] !== undefined) {
            return ruleCache[ruleName];
        }

        if (document.styleSheets) {
            for (var i = 0; i < document.styleSheets.length; i++) {
                var styleSheet = document.styleSheets[i];
                var ii = 0;
                var cssRule = false;
                do {
                    if (styleSheet.cssRules) {
                        cssRule = styleSheet.cssRules[ii];
                    } else {
                        cssRule = styleSheet.rules[ii];
                    }
                    if (cssRule) {
                        if (cssRule.selectorText.toLowerCase() == ruleName) {
                            return ruleCache[ruleName] = cssRule;
                        }
                    }
                    ii++;
                } while (cssRule);
            }
        }

        return ruleCache[ruleName] = false;
    }

    function d3_raphael_getCSSAttributes(selector) {
        var rules = d3_raphael_getCSSRule(selector),
            attributes = {};
        if (!rules) return false;
        rules = rules.style.cssText.split(';');
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i].split(':');
            if (rule[0] !== undefined && rule[1] !== undefined)
                var key = rule[0].replace(' ',''),
                    value = rule[1].replace(' ','');
            attributes[key] = value;
        }
        return attributes;
    }

    function d3_raphael_addClassesToClassName(className, addClass) {
        // adapted from jQuery addClass()
        var addClasses = addClass.split(' ');

        var setClass = ' ' + className + ' ';
        for (var i = -1, m = addClasses.length; ++i < m;) {
            if (!~setClass.indexOf(' ' + addClasses[i] + ' ')) {
                setClass += addClasses[i] + ' ';
            }
        }
        return setClass.slice(1, -1);
    }

    Raphael.st.addClass = function(addClass, parentSelector) {
        //Simple set Attribute class if SVG
        if (Raphael.svg) {
            for (var i = 0; i < this.length; i++) {
                this[i].addClass(addClass)
            };
        }
        //For IE
        else {
            var sel = '.' + addClass;
            sel = parentSelector ? parentSelector + ' ' + sel : sel;
            var attributes = d3_raphael_getCSSAttributes(sel);
            for (var i = 0; i < this.length; i++) {
                this[i].attr(attributes);
                this[i].node.className = d3_raphael_addClassesToClassName(this[i].node.className, addClass);
            }
        }
    }

    Raphael.el.addClass = function(addClass, parentSelector) {
        //easily add class
        if (Raphael.svg) {
            var cssClass = this.node.getAttribute('class') !== null ? this.node.getAttribute('class') + ' ' + addClass : addClass;
            this.node.setAttribute('class', cssClass);
        }
        //must extract CSS requirements
        else {
            var sel = '.' + addClass;
            sel = parentSelector ? parentSelector + ' ' + sel : sel;

            var attributes = d3_raphael_getCSSAttributes(sel);
            this.attr(attributes);
            this.node.className = d3_raphael_addClassesToClassName(this.node.className, addClass);
        }
    }
}
