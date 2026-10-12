var lines = [];
var N, M, Q;
var sum;

var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', function (x) {
    lines.push(x);
});

rl.on('close', function () {
    N = Number(lines[0].split(" ")[0])
    M = Number(lines[0].split(" ")[1])
    Q = Number(lines[0].split(" ")[2])
    sum = Array(N + 1).fill(0).map(i => i = Array(N + 1).fill(0));

    var L = Array(M), R = Array(M);

    for (var i = 0; i < M; i++) {
        var t = lines[i + 1].split(" ")
        L[i] = Number(t[0]); R[i] = Number(t[1]);
    }

    var p = Array(Q), q = Array(Q);
    for (var i = 0; i < Q; i++) {
        var t = lines[i + M + 1].split(" ");
        p[i] = Number(t[0]); q[i] = Number(t[1])
    }

    buildsumtable(L, R);


    for (var i = 0; i < Q; i++) {
        var ans = sum[q[i]][q[i]] - sum[q[i]][p[i] - 1] - sum[p[i] - 1][q[i]] + sum[p[i] - 1][p[i] - 1]
        console.log(ans);
    }

});

function buildsumtable(L, R) {

    for (var i = 0; i < M; i++) {
        sum[L[i]][R[i]]++;
    }

    for (var i = 1; i <= N; i++) {
        for (var j = 1; j <= N; j++) {
            sum[i][j] += sum[i - 1][j];
            sum[i][j] += sum[i][j - 1];
            sum[i][j] -= sum[i - 1][j - 1];
        }
    }
}