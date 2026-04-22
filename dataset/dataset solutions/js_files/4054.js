var lines = [];
var N, A;

var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', function (x) {
    lines.push(x);
});

rl.on('close', function () {
    N = Number(lines[0]); lines.shift();
    A = lines.map(i => i.split(" ").map(i => Number(i)));

    var q = [[0, 0, 0]];
    console.log(bfs(q));

});

function bfs(q) {
    var ans = 0, counter = 0;

    while (q.length) {
        var t = q.shift();
        var y = t[0], x = t[1]; counter = t[2] + A[y][x];

        ans = Math.max(ans, counter)

        if (x + 1 < N) { q.push([y, x + 1, counter]) }
        if (y + 1 < 2) { q.push([y + 1, x, counter]) }
    }

    return (ans);
}