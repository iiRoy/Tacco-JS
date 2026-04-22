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
    var S_ = lines[0].split("");
    var T = lines[1].split("");

    var ans = -1;

    for (var i = S_.length - 1; 0 < i - T.length + 1; i--) {
        var str_S = S_.concat().splice(i - T.length + 1, i);
        //console.log(str_S);

        for (var j = 0; j < T.length; j++) {
            if (T[j] !== str_S[j] && str_S[j] !== "?") { break; }
            if ((T[j] === str_S[j] || str_S[j] === "?") && j === T.length - 1) { ans = i - T.length + 1; }
        }

        if (ans !== -1) { break; }
    }

    if (ans === -1) { console.log("UNRESTORABLE") }
    else {
        for (var i = 0; i < S_.length; i++) {

            if (S_[i] === "?" && i !== ans) { S_[i] = "a" }
            if (i === ans) {
                for (var j = 0; j < T.length; j++) {
                    S_[i + j] = T[j];
                }
                i += T.length;
            }
        }

        console.log(S_.join(""));
    }
});