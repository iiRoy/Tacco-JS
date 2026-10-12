var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var lines = input.split('\n');

var line;
while (line = lines.shift()) {
    var arr = line.split(' ');
    var a = +arr[0];
    var b = +arr[1];
    var n = +arr[2];

    var str = (a / b).toFixed(n + 1);
    var idx = str.indexOf('.');
    str = str.substring(idx + 1, str.length - 1);
    s = str.split('').reduce(function(p,n){return (+p)+(+n);});

    console.log(s);
}