var line; var result = 0;
var S; var abc = ["A", "B", "C"];
var MOD = Math.pow(10,9)+7;

var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', function (x) {
    line = x;
});

rl.on('close', function () {
    S = line.split("");
    dfs(0, []);
    console.log(result);
});

function dfs(n, comb) {
    if (n === S.length) { calc(comb); return (0); }

    if (S[n] === "?") {
        comb[n] = "A"; dfs(n + 1, comb);
        comb[n] = "B"; dfs(n + 1, comb);
        comb[n] = "C"; dfs(n + 1, comb);
    }
    else {
        comb[n] = S[n]; dfs(n + 1, comb);
    }
}

function calc(comb) {

    var dp = Array(S.length).fill(0)
    for (var i = 0; i < S.length; i++) {
        dp[i] = Array(3).fill(0);
    }

    if (comb[0] === abc[0]) { dp[0][0] += 1; }

    for (var i = 1; i < S.length; i++) {
        if (comb[i] === abc[0]) { dp[i][0] += dp[i - 1][0] + 1; }
        else { dp[i][0] = dp[i - 1][0]; }
    }

    for (var i = 1; i < abc.length; i++) {
        dp[0][i] = 0;
    }

    for (var j = 1; j < 3; j++) {
        var abc_counter = {};
        for (var i = 1; i < S.length; i++) {
            if (abc_counter[comb[i]] === undefined) abc_counter[comb[i]] = 0;

            if (comb[i] === abc[j] && dp[i - 1][j - 1] !== 0) {
                dp[i][j] += dp[i - 1][j - 1] + abc_counter[comb[i]];
                abc_counter[comb[i]]++;
            }
            else {
                dp[i][j] = dp[i - 1][j];
            }
        }
    }
    result += (dp[S.length - 1][2] % MOD);
}