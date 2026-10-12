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
    var N = Number(lines[0]);
    var ans = 0;

    // N = k * m + k = k(m + 1)
    for (var k = 1; k < Math.sqrt(N); k++) {
        if (N / k === Math.floor(N / k) && k !== N / k - 1) { ans += N / k - 1 }
    }

    console.log(ans);
});