import "../arrays/set";
import "../xhr/xhr";

d3.dsv = function(delimiter, mimeType) {
  var reFormat = new RegExp("[\"" + delimiter + "\n]"),
      delimiterCode = delimiter.charCodeAt(0);

  function dsv(url, row, callback) {
    if (arguments.length < 3) callback = row, row = null;
    var xhr = d3_xhr(url, mimeType, row == null ? response : typedResponse(row), callback);

    xhr.row = function(_) {
      return arguments.length
          ? xhr.response((row = _) == null ? response : typedResponse(_))
          : row;
    };

    return xhr;
  }

  function response(request) {
    return dsv.parse(request.responseText);
  }

  function typedResponse(f) {
    return function(request) {
      return dsv.parse(request.responseText, f);
    };
  }

  dsv.parse = function(text, f) {
    var header, prototype = type.prototype;

    if (!f) f = d3_identity;

    function type() {}

    function process(text) {
      return dsv.parseRows(text, function(row, i) {
        var j = -1, m = row.length;
        if (i) {
          var t = new type();
          while (++j < m) t[header[j]] = row[j];
          return f(t, i - 1);
        } else {
          header = row;
          while (++j < m) prototype[header[j]] = null;
        }
      });
    }

    return (arguments.length) ? process(text) : process;
  };

  dsv.parseRows = function(text, f) {
    var EOL = {}, // sentinel value for end-of-line
        EOF = {}, // sentinel value for end-of-file
        rows = [], // output rows
        N = text.length,
        I = 0, // current character index
        n = 0, // the current line number
        t, // the current token
        eol; // is the current token followed by EOL?

    function token() {
      if (I >= N) return EOF; // special case: end of file
      if (eol) {
        eol = false;
        return EOL; // special case: end of line
      }
      var c, k, i, j;

      // special case: quotes
      j = I;
      if (text.charCodeAt(j) === 34) {
        i = j;
        while (i++ < N) {
          if (text.charCodeAt(i) === 34) {
            if (text.charCodeAt(i + 1) !== 34) break;
            ++i;
          }
        }
        I = i + 2;
        c = text.charCodeAt(i + 1);
        if (c === 13) {
          eol = true;
          if (text.charCodeAt(i + 2) === 10) ++I;
        } else if (c === 10) {
          eol = true;
        }
        return text.slice(j + 1, i).replace(/""/g, "\"");
      }

      // common case: find next delimiter or newline
      while (I < N) {
        c = text.charCodeAt(I++);
        k = 1;
        if (c === 10) eol = true; // \n
        else if (c === 13) { eol = true; if (text.charCodeAt(I) === 10) ++I, ++k; } // \r|\r\n
        else if (c !== delimiterCode) continue;
        return text.slice(j, I - k);
      }

      // special case: last token before EOF
      return text.slice(j);
    }

    while ((t = token()) !== EOF) {
      var a = [];
      while (t !== EOL && t !== EOF) {
        a.push(t);
        t = token();
      }
      if (f && (a = f(a, n++)) == null) continue;
      rows.push(a);
    }

    return rows;
  };

  dsv.format = function(rows) {
    if (Array.isArray(rows[0])) return dsv.formatRows(rows); // deprecated; use formatRows
    var fieldSet = new d3_Set(), fields = [];

    // Compute unique fields in order of discovery.
    rows.forEach(function(row) {
      for (var field in row) {
        if (!fieldSet.has(field)) {
          fields.push(fieldSet.add(field));
        }
      }
    });

    return [fields.map(formatValue).join(delimiter)].concat(rows.map(function(row) {
      return fields.map(function(field) {
        return formatValue(row[field]);
      }).join(delimiter);
    })).join("\n");
  };

  dsv.formatRows = function(rows) {
    return rows.map(formatRow).join("\n");
  };

  function formatRow(row) {
    return row.map(formatValue).join(delimiter);
  }

  function formatValue(text) {
    return reFormat.test(text) ? "\"" + text.replace(/\"/g, "\"\"") + "\"" : text;
  }

  return dsv;
};
