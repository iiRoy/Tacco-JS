var lines = []; var result = 0;
var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', function (x) {
    lines.push(x);
})

rl.on('close', function () {
    var X = Number(lines[0]);

    for (var i = 1; i <= X; i++) {
        if (Math.pow(i, 10) <= X) { ans = Math.pow(i, 10) }
        if (Math.pow(i, 9) <= X) { ans = Math.pow(i, 9) }
        if (Math.pow(i, 8) <= X) { ans = Math.pow(i, 8) }
        if (Math.pow(i, 7) <= X) { ans = Math.pow(i, 7) }
        if (Math.pow(i, 6) <= X) { ans = Math.pow(i, 6) }
        if (Math.pow(i, 5) <= X) { ans = Math.pow(i, 5) }
        if (Math.pow(i, 4) <= X) { ans = Math.pow(i, 4) }
        if (Math.pow(i, 3) <= X) { ans = Math.pow(i, 3) }
        if (Math.pow(i, 2) <= X) { ans = Math.pow(i, 2) }
    }

    console.log(ans);
});