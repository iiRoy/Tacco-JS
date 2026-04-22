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
    var N = Number(lines[0]);
    lines.shift();

    var uvw = lines.map(i => i.split(" ").map(i => Number(i)))
    var cost = Array(N).fill(Infinity).map(i => i = Array(N).fill(Infinity))

    for (var i = 0; i < N - 1; i++) {
        var u = uvw[i][0]; var v = uvw[i][1]; var w = uvw[i][2]
        cost[i][i] = 0
        cost[u - 1][v - 1] = w; cost[v - 1][u - 1] = w;
    }
    cost[N - 1][N - 1] = 0;


    var ans = Array(N).fill("");
    var start = 0;

    ans[start] = "0"
    var q = [[start, ans[start]]];

    while (q.length) {
        var t = q.pop();
        var node = t[0]; var color = t[1];

        for (var i = 0; i < N; i++) {
            if (ans[i] !== "" || cost[node][i] === Infinity) { continue; }
            if (cost[node][i] % 2 === 0) { ans[i] = color; q.push([i, ans[i]]); }
            if (cost[node][i] % 2 === 1) { ans[i] = (color === "0" ? "1" : "0"); q.push([i, ans[i]]); }
        }
    }
    for (var i = 0; i < ans.length; i++) {
        console.log(ans[i])
    }
});