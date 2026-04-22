var lines = [], A;
var H, W;
var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', function (x) {
    lines.push(x);
});

rl.on('close', function () {
    H = Number(lines[0].split(" ")[0]);
    W = Number(lines[0].split(" ")[1]);

    lines.shift();

    A = lines.map(i => i.split(""))
    var black = []

    for (var i = 0; i < H; i++) {
        for (var j = 0; j < W; j++) {
            if (A[i][j] === "#") { black.push([i, j, 0]); }
        }
    }

    console.log(bfs(black));

});

function bfs(q) {

    var max = 0; var count = 0;
    var m = Array(H).fill(-1).map(i => i = Array(W).fill(-1));

    while (q.length) {
        var a = q.shift();
        var y = a[0], x = a[1];
        count = a[2];

        if (m[y][x] !== -1) { continue; }

        m[y][x] = count;
        max = Math.max(max, count);

        if (y + 1 < H) { q.push([y + 1, x, count + 1]); }
        if (0 < y - 1) { q.push([y - 1, x, count + 1]); }
        if (x + 1 < W) { q.push([y, x + 1, count + 1]); }
        if (0 < x - 1) { q.push([y, x - 1, count + 1]); }
    }

    return (max);
}