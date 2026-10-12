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

    var uvw = lines.map(i => i.split(" ").map(i => Number(i)));

    // 2頂点間の距離をみて 偶数: 同じ色　　奇数:異なる色で塗る
    // "0"は白　，"1"は黒
    // 頂点0は白とする

    // 始点で昇順ソート
    uvw.sort((a, b) => {
        if (a[1] === b[1]) { return (a[0] - b[0]) }
        else { return (a[1] - b[1]); }
    })
    console.log(uvw)
    var color = Array(N).fill(-1); color[0] = 0;

    while (uvw.length) {
        var t = uvw.shift();
        var u = t[0]; var v = t[1]; var w = t[2];

        if (color[u - 1] !== -1) { if (w % 2 === 0) { color[v - 1] = color[u - 1] } else { color[v - 1] = 1 - color[u - 1] } }
        else {
            if (color[v - 1] !== -1) { if (w % 2 === 0) { color[u - 1] = color[v - 1] } else { color[u - 1] = 1 - color[v - 1] } }
            else { uvw.push(t) }
        }
    }

    for (var i = 0; i < N; i++) { console.log(color[i]); }
});

