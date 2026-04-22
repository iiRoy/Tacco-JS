var lines = [];
var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', function (x) {
    lines.push(x);
});

rl.on('close', function () {
    var K = Number(lines[0]);
    var d = Array(K).fill(Infinity).map(i => i = Array(K).fill(Infinity))

    for (var i = 0; i < K; i++) {
        d[i][(i + 1) % K] = 1;
        d[i][(i * 10) % K] = 0;
        d[i][i] = 0;
    }

    var start = 1; var end = 0
    for (var i = 0; i < K; i++) {
        for (var j = 0; j < K; j++) {
            for (var k = 0; k < K; k++) {
                d[j][k] = Math.min(d[j][k], d[j][i] + d[i][k])
            }
        }
    }
    console.log(d[start][end] + 1)
});
