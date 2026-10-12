var lines = [];
var ans = 0;
var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', function (x) {
    lines[lines.length] = x;
});

rl.on('close', function () {
    var X = parseInt(lines[0], 10);
    var powers = [10, 9, 8, 7, 6, 5, 4, 3, 2];

    for (var i = 1; i <= X; i++) {
        for (var j = 0; j < powers.length; j++) {
            var value = Math.pow(i, powers[j]);

            if (value <= X) {
                ans = value;
            }
        }
    }

    console.log(ans);
});