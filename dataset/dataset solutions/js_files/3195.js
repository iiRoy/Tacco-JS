var lines = [];
var N, M;
var a, dp;

var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', function (x) {
    lines.push(x);
});

rl.on('close', function () {
    var number = [0, 2, 5, 5, 4, 5, 6, 3, 7, 6];

    N = Number(lines[0].split(" ")[0]);
    M = Number(lines[0].split(" ")[1]);
    a = Array(M + 1);

    a[0] = { number: 0, match: 0 };

    var tmp = lines[1].split(" ");
    for (var i = 1; i <= M; i++) {
        a[i] = {
            number: Number(tmp[i - 1]),
            match: Number(number[tmp[i - 1]]),
        }

    }
    var cont = "";
    dp = Array(N + 1); dp.fill("");

    // w : Weigt
    // n : Match Number
    for (var w = 1; w <= N; w++) {
        for (var n = 1; n <= M; n++) {
            match = w - a[n].match;

            if (match < 0) { continue; }
            else {
                cont = dp[match] + a[n].number;
                if (dp[w].length < cont.length || (dp[w].length === cont.length && dp[w] < cont)) {
                    dp[w] = cont;
                }
            }
        }
    }

    console.log(dp[N]);

});
