var inputLines = [];

var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', function (x) {
    inputLines[inputLines.length] = x;
});

rl.on("close", function () {
    var first = inputLines[0].split(" ");
    var a = parseInt(first[0], 10);
    var b = parseInt(first[1], 10);

    var diff = b - a;
    var h = Array(1000).fill(0);
    var answer = 0;

    for (var i = 1; i < h.length; i++) {
        h[i] = h[i - 1] + i;

        if (diff === i) {
            answer = h[i] - b;
            break;
        }
    }

    console.log(answer);
});