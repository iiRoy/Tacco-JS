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
    var c = lines.map(i => i.split(" ").map(i => Number(i)));
    
    // biを仮定する
    for (var a1 = 0; a1 <= 100; a1++) {
        var b1 = c[0][0] - a1
        var b2 = c[1][0] - a1
        var b3 = c[2][0] - a1

        // 仮定したbiが正しいか検証する
        for (var a2 = 0; a2 <= 100; a2++) {
            if (a2 + b1 !== c[0][1]) { continue }
            if (a2 + b2 !== c[1][1]) { continue }
            if (a2 + b3 !== c[2][1]) { continue }
            
            for (var a3 = 0; a3 <= 100; a3++) {
                if (a3 + b1 !== c[0][2]) { continue }
                if (a3 + b2 !== c[1][2]) { continue }
                if (a3 + b3 !== c[2][2]) { continue }
                
                // 正しければ Yes
                console.log("Yes");
                return (0)
            }
        }
    }
    // 間違っていれば No
    console.log("No")

});
