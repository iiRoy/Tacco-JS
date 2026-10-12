var lines = [];
var a;

var readline = require("readline");
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on("line", function (x) {
    lines.push(x);
});

rl.on("close", function () {
    var tmp = lines.shift().split(" ");
    var L = Number(tmp[0]);
    var N = Number(tmp[1]);


    var X = Array(N);
    for (var i = 0; i < N; i++) {
        X[i] = Number(lines[i]);
    }
    X.sort(function (a, b) { return (a - b); });


    var right = 0; var left = N - 1;
    var a_l = L - X[left]; var a_r = X[right];
    var result_l = 0

    // 初手，左に移動した場合
    for (var counter = 0; counter < N; counter++) {
        // leftに動いた場合
        if (a_r <= a_l || counter === 0) {
            result_l += a_l;
            a_r += a_l
            a_l = X[left] - X[left - 1];
            left--;
        }

        // rightに動いた場合
        else {
            result_l += a_r;
            a_l += a_r;
            a_r = X[right + 1] - X[right];
            right++;
        }
    }


    var right = 0; var left = N - 1;
    var a_l = L - X[left]; var a_r = X[right];
    var result_r = 0;

    // 初手，左に移動した場合
    for (var counter = 0; counter < N; counter++) {
        // rightに動いた場合
        if (a_l <= a_r || counter === 0) {
            result_r += a_r;
            a_l += a_r;
            a_r = X[right + 1] - X[right];
            right++;
        }

        // leftに動いた場合
        else {
            result_r += a_l;
            a_r += a_l
            a_l = X[left] - X[left - 1];
            left--;
        }
    }
    console.log(Math.max(result_l,result_r));
});
