var lines = [];
var MOD = 1000000007

var N, M
var a
var memo
var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', function (x) {
    lines.push(x);
});

rl.on('close', function () {
    N = Number(lines[0].split(" ")[0]);
    M = Number(lines[0].split(" ")[1]);
    lines.shift();
    a = lines.map(i => Number(i));

    memo = Array(N).fill(0)
    console.log(dfs(0));

});

function dfs(n) {
    if (memo[n]) { return (memo[n]) }
    if (N < n) { return (0) }
    if (n === N) { return (1) }
    else {
        for (var i = 0; i < M; i++) {
            var res = 0;
            if (n === a[i]) { return (0) }
            else {
                res += dfs(n + 1);
                res %= MOD;
                res += dfs(n + 2);
                res %= MOD;
            }
        }
    }
    memo[n] = res
    return (memo[n])
}