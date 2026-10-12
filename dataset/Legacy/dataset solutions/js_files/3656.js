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
    var S = lines[0].split("")
    var T = lines[1].split("")

    for (var i = 0; i < T.length; i++){
        if(S === T){console.log("Yes"); return(0)}
        var x = S.pop()
        S.unshift(x);
    }
    console.log("No");
});