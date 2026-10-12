var inp = require('fs').readFileSync('/dev/stdin', 'utf8').trimEnd().split('\n');
var first = inp.shift().split(' ');
var H = Number(first[0]);
var W = Number(first[1]);
var K = Number(first[2]);

var o = [];
var idx = 1;
var r = null;

for (var i = 0; i < H; i++) {
    var a = [];
    o[i] = [];

    for (var j = 0; j < W; j++) {
        if (inp[i].charAt(j) == '#') {
            a[a.length] = j;
        }
    }

    if (a.length === 0) {
        if (r) {
            o[i] = r.slice();
        } else {
            o[i] = 'e';
        }
        continue;
    }

    var pos = 0;

    while (a.length > 0) {
        var k = a.shift();

        while (pos <= k) {
            o[i][pos] = idx;
            pos++;
        }

        idx++;
    }

    while (pos < W) {
        o[i][pos] = idx - 1;
        pos++;
    }

    r = o[i].slice();
}

if (o[0] == 'e') {
    var p = 1;

    while (p < H && o[p] == 'e') {
        p++;
    }

    var fill = o[p];
    p--;

    while (p >= 0) {
        o[p] = fill.slice();
        p--;
    }
}

var ans = [];

for (var y = 0; y < H; y++) {
    ans.push(o[y].join(" "));
}

console.log(ans.join('\n'));