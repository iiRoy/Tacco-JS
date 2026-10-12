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
    var X = lines[1].split(" ").map(i => Number(i));

    var ans = Infinity;

    for (var i = 0; i + K - 1 < N; i++) {
        var left = i; var right = i + K - 1;

        var result_1 = Math.abs(X[left]) + Math.abs(X[right] - X[left]);  // 0 --> Right --> Left
        var result_2 = Math.abs(X[right]) + Math.abs(X[right] - X[left]); // 0 --> Left --> Right

        ans = Math.min(ans, result_1, result_2);
    }
    console.log(ans)
});