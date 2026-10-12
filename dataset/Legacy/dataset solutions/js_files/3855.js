var lines = [];
var B_counter, S, H, W
var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', function (x) {
    lines.push(x);
});

rl.on('close', function () {
    H = Number(lines[0].split(" ")[0])
    W = Number(lines[0].split(" ")[1])
    lines.shift()

    S = lines.map(i => i.split(""))

    //console.log(S)

    B_counter = 0; var q = []
    for (var i = 0; i < H; i++) {
        for (var j = 0; j < W; j++) {
            if (S[i][j] === "#") { q.push([i, j]); B_counter++; }
        }
    }
    console.log(bfs(q));
});

function bfs(q) {

    var black = 0; var ans = "No";

    while (q.length) {

        var t = q.shift();
        var y = t[0], x = t[1];

        if (0 <= x + 1 && x + 1 < W) { if (S[y][x + 1] === "#") { S[y][x + 1] = "."; black++; q.push([y, x + 1]) } }
        if (0 <= x - 1 && x - 1 < W) { if (S[y][x - 1] === "#") { S[y][x - 1] = "."; black++; q.push([y, x - 1]) } }
        if (0 <= y + 1 && y + 1 < H) { if (S[y + 1][x] === "#") { S[y + 1][x] = "."; black++; q.push([y + 1, x]) } }
        if (0 <= y - 1 && y - 1 < H) { if (S[y - 1][x] === "#") { S[y - 1][x] = "."; black++; q.push([y - 1, x]) } }

    }
    
    if (black === B_counter) { ans = "Yes"; }

    return (ans);
}