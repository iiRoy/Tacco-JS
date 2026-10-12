var lines = [];

var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

rl.on('line', function (x) {
    lines.push(x);
});

rl.on("close", function () {
    var a = Number(lines[0].split(" ")[0]);
    var b = Number(lines[0].split(" ")[1]);

    var ba = b - a;
    var h = Array(999).fill(0);

    for (var i = 1; i <= 999; i++) {
        h[i] = h[i - 1] + i;
        if (ba === i) { console.log(h[i] - b); return (0) }
    }

});