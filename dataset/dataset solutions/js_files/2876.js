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
    var N = Number(lines[0].split(" ")[0]);
    var A = Number(lines[0].split(" ")[1]);
    var B = Number(lines[0].split(" ")[2]);
    var C = Number(lines[0].split(" ")[3]);
    var D = Number(lines[0].split(" ")[4]);

    var S = lines[1].split("");

    var flag = false;

    for (var i = 0; i < S.length; i++) {
        if ((S[i] === "#" && S[i + 1] === "#") && A <= i && i + 1 <= Math.max(C, D)) { console.log("No"); return (0) }
        if ((S[i] === "." && S[i + 1] === "." && S[i + 2] === ".") && B <= i + 1 && i + 1 <= D) { flag = true }
    }

    if (D < C && (S[B - 2] === "#" || S[B] === "#" || S[D - 2] === "#" || S[D] === "#") && flag === false) { console.log("No"); }
    else { console.log("Yes"); }
});
