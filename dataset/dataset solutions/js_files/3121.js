var lines = [];
var MOD = Math.pow(10, 9) + 7
var result = 1;

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
    var S = lines[1].split("");

    S.sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));

    var counter = []; var cnt = 1;
    for (var i = 1; i < N; i++) {
        if (S[i - 1] !== S[i]) { counter.push(cnt); cnt = 0; }
        cnt++;
    }

    counter.push(cnt);

    for (var i = 0; i < counter.length; i++) {
        result *= counter[i] + 1;
    }

    console.log(result - 1);
});