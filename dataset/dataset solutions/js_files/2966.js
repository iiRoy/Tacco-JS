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
    var M = Number(lines[0].split(" ")[1]);

    lines.shift();

    var XYZ = lines.map(i => i.split(" ").map(i => Number(i)))
    var check = Array(N).fill(-1); var ans = 0;

    XYZ.sort((a, b) => a[0] - b[0])

    while (XYZ.length) {
        var t = XYZ.shift();
        var x = t[0]; var y = t[1]; var z = t[2];

        if (check[x - 1] !== -1) { check[y - 1] = 1 }
        else if (check[y - 1] !== -1) { check[x - 1] = 1 }
        else { ans++; check[x - 1] = 1; check[y - 1] = 1 }
    }


    for (var i = 0; i < N; i++) {
        if (check[i] === -1) { ans++ }
    }
    console.log(ans);
});