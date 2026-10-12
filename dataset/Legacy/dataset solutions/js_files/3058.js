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
    var tmp_1 = lines.shift().split(" ");
    var N = Number(tmp_1[0]);
    var K = Number(tmp_1[1]);

    var v = lines[0].split("");

    var Nums = [];
    var now = 1; 
    var cnt = 0;

    // 1-0-1-0-1
    for (var i = 0; i < N; i++) {
        if (v[i] === now.toString()) { cnt++; }
        else {
            Nums.push(cnt);
            now = 1 - now; // 0-1反転
            cnt = 1;
        }
    }

    // cntが0でなければ，配列に加える
    if (cnt != 0) { Nums.push(cnt); }

    // 1-0-1-0-...-1のような配列を用意する
    if (Nums.length % 2 === 0) { Nums.push(0); }
    
    var cnt = 0; var result = 1;
    for (var i = 0; i < Nums.length; i++) {
        if (i % 2 === 0) {
            for (var j = 0; j <= 2 * K; j++) { cnt += Nums[i + j]; }
            if (result < cnt) { result = cnt; }
            cnt = 0;
        }
    }

    console.log(result);
});