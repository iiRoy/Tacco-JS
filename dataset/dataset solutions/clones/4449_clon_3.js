var inp = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
var l = inp.shift().split(' ');
var H = Number(l[0]);
var W = Number(l[1]);
var N = Number(inp.shift());

var ans = [];
for (var i = 0; i < H; i++) {
    ans[i] = [];
    for (var j = 0; j < W; j++) {
        ans[i][j] = undefined;
    }
}

var counts = inp.shift().split(' ').map(function(v) {
    return Number(v);
});

var h = 0;
var w = 0;
var m = 'R';

for (var color = 0; color < N; color++) {
    var n = counts[color];

    while (n > 0) {
        ans[h][w] = color + 1;

        if (m == 'R') {
            if (w == W - 1) {
                h++;
                m = 'L';
            } else {
                w++;
            }
        } else {
            if (w === 0) {
                h++;
                m = 'R';
            } else {
                w--;
            }
        }

        n--;
    }
}

var output = [];
for (var r = 0; r < H; r++) {
    output.push(ans[r].join(' '));
}

console.log(output.join('\n'));