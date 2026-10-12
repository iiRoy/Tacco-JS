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

    var result = 0;
    var center = 0; var right = 0; var left = N - 1
    var a_l = L - X[left]
    var a_r = X[right];

    for (var counter = 0; counter < N; counter++) {
        // leftに動いた場合
        //console.log(X[left],center, X[right], " ", a_l, a_r);
        if (a_r <= a_l) {
            result += a_l;
            center = X[left]; left--;
            a_l = center - X[left];
            a_r = L - (center - X[right]);
        }
        // rightに動いた場合
        else {
            result += a_r;
            center = X[right]; right++;
            a_l = L - (X[left] - center);
            a_r = X[right] - center;
        }
    }
    console.log(result);
});
