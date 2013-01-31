var fs = require("fs"),
    puts = require("util").puts,
    formats = {},
    kvRe = /=/,
    valueRe = /;/g,
    quotedRe = /"([^"]*?)"/g,
    data = [];

if (0) {
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", function(chunk) { data.push(chunk); });
  process.stdin.on("end", write);
} else {
  var locale = "LC_NUMERIC\n\
decimal_point=\".\"\n\
thousands_sep=\"\"\n\
grouping=-1\n\
numeric-decimal-point-wc=46\n\
numeric-thousands-sep-wc=0\n\
numeric-codeset=\"ANSI_X3.4-1968\"\n\
\n\
LC_TIME\n\
abday=\"Sun;Mon;Tue;Wed;Thu;Fri;Sat\"\n\
day=\"Sunday;Monday;Tuesday;Wednesday;Thursday;Friday;Saturday\"\n\
abmon=\"Jan;Feb;Mar;Apr;May;Jun;Jul;Aug;Sep;Oct;Nov;Dec\"\n\
mon=\"January;February;March;April;May;June;July;August;September;October;November;December\"\n\
am_pm=\"AM;PM\"\n\
d_t_fmt=\"%a %d %b %Y %r %Z\"\n\
d_fmt=\"%m/%d/%Y\"\n\
t_fmt=\"%r\"\n\
t_fmt_ampm=\"%I:%M:%S %p\"\n\
era=\n\
era_year=\"\"\n\
era_d_fmt=\"\"\n\
alt_digits=\n\
era_d_t_fmt=\"\"\n\
era_t_fmt=\"\"\n\
time-era-num-entries=0\n\
time-era-entries=\"S\"\n\
week-ndays=7\n\
week-1stday=19971130\n\
week-1stweek=7\n\
first_weekday=1\n\
first_workday=2\n\
cal_direction=1\n\
timezone=\"\"\n\
date_fmt=\"%a %b %e %H:%M:%S %Z %Y\"\n\
time-codeset=\"UTF-8\"\n\
";
  data = locale.split("\n");
  write();
}

function write() {
  data.join("\n").split(/\n/g).forEach(function(line) {
    var i = line.match(kvRe);
    if (i && (i = i.index)) {
      var value = line.substring(i + 1).replace(quotedRe, "$1").split(valueRe);
      formats[line.substring(0, i)] = value;
    }
  });

  puts(fs.readFileSync(process.argv[2], "utf8").replace(/\{([^\}]+)\}/g, function(d, k) {
    d = formats[k];
    return k === "grouping"
        ? d === "127" || d === "0" ? null : "[" + d.map(Number).join(", ") + "]"
        : d == null ? null : d.length > 1 ? "[" + d.map(quote).join(", ") + "]" : quote(d[0]);
  }));
}

function quote(d) { return '"' + d + '"'; }
