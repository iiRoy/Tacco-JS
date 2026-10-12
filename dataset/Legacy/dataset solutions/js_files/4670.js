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
    var tmp = lines.shift();

    var N = tmp.split(" ")[0];
    var A = tmp.split(" ")[1];
    var B = tmp.split(" ")[2];
    var v = Array(N);

    tmp = lines.shift().split(" ");
    for (var i = 0; i < N; i++) {
        v[i] = Number(tmp[i])
    }

    v.sort(function (a, b) { return (b - a); });
    var average_max = 0
    var C = {};

    for (var i = 0; i < N; i++) {
        if (i < A) average_max += v[i];
        if (C[v[i]] === undefined) { C[v[i]] = 0; }

        C[v[i]]++;
    }
    average_max /= A;
    console.log(average_max);


    var counter = 0; var tmp = 1;

    if (v[0] !== v[B - 1]) {
        var comb = 1;
        for (var i = 0; i < N; i++) {
            if (C[v[i]] >= 2) {
                C[v[i]] > (A - counter) ? j = A - counter : j = C[v[i]];
                comb *= combination(C[v[i]], j);
                counter += C[v[i]];
                i += C[v[i]] - 1;
            }
            else {
                counter += C[v[i]];
            }
        }
    }
    else {
        var comb = 0;
        for (var j = A; j <= B; j++) {
            comb += combination(C[v[0]], j);
        }
    }
    console.log(comb);

});

function permutation(n, r) {
    var res = 1;
    for (var i = 0; i < r; i++) {
        res *= n - i;
    }
    return res;
}

function combination(n, r) {
    return permutation(n, r) / permutation(r, r);
}