var lines = []; var f;
var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', function (x) {
    lines.push(x);
});

rl.on('close', function () {

    /* --TLE-- */

    var N = Number(lines[0].split(" ")[0]);
    var X = Number(lines[0].split(" ")[1]);

    var result = 0;

    // バーガーの厚さの数列
    // an+1 = 2an + 3
    // (an+1 + 3) = 2(an +3)
    // 2(an + 3) = 2^n(a1 + 3)
    // an =  2^(n+2) - 3

    // パティの量
    // bn+1 = 2bn + 1
    // bn+1 + 1 = 2(bn + 1)
    // 2(bn + 1) = 2^n(b1 + 1)
    // bn = 2^(n+1) - 1

    console.log(dfs(N, X));
});

// 第nバーガー， 第x層までルンルンが食べる
function dfs(n, x) {
    var len = Math.pow(2, n + 1) - 3; // バーガーの厚さ
    var num = Math.pow(2, n) - 1; // パティの厚さ

    if (n === 0) { return (1); } // 0段バーガーのパティは1枚

    if (x === 1) { return (0); } // ルンルンが1層しか食べない場合，それはパン
    else if (x <= len + 1) { return (dfs(n - 1, x - 1)) } // ルンルンが食べるハンバーガーが半分以下ならば
    else if (x == len + 2) { return (num + 1) }// ルンルンが食べるハンバーガーがちょうど半分
    else if (x <= (len + 1) * 2) { return (num + 1 + dfs(n - 1, x - len - 2)); }　// ルンルンが食べるハンバーガーが半分以上全部未満
    else { return (num * 2 + 1) }// ルンルンがハンバーガーを全部食べる
    
    // dfsの引数にx-1を渡すのは，最下層がパンであるため
}