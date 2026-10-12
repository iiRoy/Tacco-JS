var lines = [];
var MOD = Math.pow(10, 9) + 7;
var result = 1;

var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', function (x) {
    lines[lines.length] = x;
});

rl.on('close', function () {
    var N = parseInt(lines[0], 10);
    var S = lines[1].trim().split("");

    S.sort(function(a, b) {
        return a.charCodeAt(0) - b.charCodeAt(0);
    });

    var counter = [];
    var cnt = 0;
    var prev = "";

    for (var i = 0; i < N; i++) {
        if (i === 0) {
            prev = S[i];
            cnt = 1;
            continue;
        }

        if (prev !== S[i]) {
            counter.push(cnt);
            prev = S[i];
            cnt = 1;
        } else {
            cnt++;
        }
    }

    if (N > 0) {
        counter.push(cnt);
    }

    for (var i = 0; i < counter.length; i++) {
        result = result * (counter[i] + 1);
    }

    console.log(result - 1);
});