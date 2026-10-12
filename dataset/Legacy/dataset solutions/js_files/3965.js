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
    var M = Number(lines[N + 1])

    var s = [];
    var moji = {};
    for (var i = 1; i - 1 < N; i++) {
        moji[lines[i]] === undefined ? moji[lines[i]] = 1 : moji[lines[i]]++;
    }

    var t = [];
    for (var i = N + 2; i - (N + 2) < M; i++) {
        moji[lines[i]] === undefined ? moji[lines[i]] = -1 : moji[lines[i]]--;
    }

    var ans = 0;
    Object.keys(moji).forEach(value => {
        if (ans < moji[value]) { ans = moji[value] }
    });
    console.log(ans);
});