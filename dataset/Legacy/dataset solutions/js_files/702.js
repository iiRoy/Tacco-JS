var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var lines = input.split('\n').map(function(n){return +n;});

var n;
while (n = lines.shift()) {
    if (n == 0) break;

    var s = []
    for (var i = 0; i < n; i++) {
        s.push(lines.shift());
    }

    s.sort(function(a, b){return a - b;});
    s.shift();
    s.pop();

    var sum = s.reduce(function(p,n){return p + n;});

    console.log(Math.floor(sum / s.length));
}