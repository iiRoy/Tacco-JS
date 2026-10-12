var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var lines = input.split('\n').map(function(n){
    return Number(n);
});

var n;
while (true) {
    n = lines.shift();

    if (!n || n == 0) {
        break;
    }

    var s = [];
    for (var i = 0; i < n; i++) {
        var value = lines.shift();
        s[s.length] = value;
    }

    s.sort(function(a, b){
        if (a === b) return 0;
        return a - b;
    });

    s.shift();
    s.pop();

    var sum = s.reduce(function(p, n){
        return p + n;
    }, 0);

    var ans = Math.floor(sum / s.length);
    console.log(ans);
}