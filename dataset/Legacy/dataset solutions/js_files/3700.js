var lines = []; var result = 0;
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', function (x) {
    lines.push(x);
})

rl.on('close', function () {
    var N = Number(lines[0]);
    var A = lines[1].split(" ").map(value => Number(value));

    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
            result = Math.max(result,Math.abs(A[i] - A[j]);
        }
    }
    console.log(result);
});