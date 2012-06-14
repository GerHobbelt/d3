function throw_raphael_not_supported() {
    console.error('Not Supported!'); // clint.tseng@socrata.com 2012/05/31: stacktraces in firefox
    throw "Not Supported!";
};

function d3_raphael_pathArrayToString(pa) {
    var ret = "";

    for(var i = 0; i < pa.length; i++) {
        var p = pa[i];

        ret += p[0];

        if(p[1])
            ret += (p[1].join(","))
    }

    return ret;
}

function d3_raphael_functify(f) {
    return (typeof f === "function") ? f : function() { return f; };
}
