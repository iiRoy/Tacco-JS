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
    var N = Number(lines[0].split(" ")[0]);
    var K = Number(lines[0].split(" ")[1]);
    lines.shift();

    var h = lines.map(value => Number(value));

    // 昇順ソート
    h.sort((a, b) => a - b);

    var result = Infinity;

    for (var i = 0; i < h.length; i++) {
        if (result > h[i + K - 1] - h[i]) { result = h[i + K - 1] - h[i]; }
    }
    console.log(result);
});