var lines = [];
var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', function (x) {
    lines.push(x);
})

rl.on('close', function () {
    var MOD = Math.pow(10, 9) + 7;
    var N = Number(lines.shift());
    var C = Array(N);

    for (var i = 0; i < N; i++) {
        C[i] = Number(lines[i]);
    }

    var number = {}; var result = 0;
    // 1,2,1,2,2
    // 2,1,2,1,2,1 = (2,1,2,1,2,1), (2,2,2,1,2,1), (2,1,2,1,1,1), (2,2,2,1,1,1), (2,1,1,1,2,1), (2,1,2,2,2,1), (2,1,1,1,1,1), (2,2,2,2,2,1)
    // 1,2,1,2,2,1 = (1,2,1,2,2,1), (1,1,1,2,2,1), (1,2,2,2,2,1), (1,1,1,1,1,1), (1,2,1,1,1,1)
    // 1,1,2,1,2,1 = (1,1,2,1,2,1), (1,1,1,1,2,1), (1,1,2,2,2,1), (1,1,2,1,1,1), (1,1,1,1,1,1)
    // x,x,x,x,x,x,x (4)
    // x,x,x,x,x,x,x,x (6)
    // x,x,x,x,x,x,x,x,x (9)
    for (var i = 0; i < N - 1; i++) {
        if (C[i] !== C[i + 1]) { number[C[i]] === undefined ? number[C[i]] = 1 : number[C[i]]++; }
    }
    // 文字列の最後C[N-1]は無条件にインクリメントする
    number[C[N - 1]]++;

    // 同じ数字を無作為に2つ取得する(Combination)
    Object.keys(number).forEach(function (keys) {
        result += Co(number[keys], 2);
        result %= MOD;
    });

    // 初期状態もカウントしていいので +1
    // 数え上げ不足...
    console.log(result + 1);
});

function P(n, m) {
    var result = 1; counter = 0;
    while (counter < m) {
        result *= n;
        n--; counter++;
    }
    return (result);
}
function Co(n, m) {
    return (P(n, m) / P(m, m));
}