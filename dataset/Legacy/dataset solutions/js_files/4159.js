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
    var a = lines[1].split(" ").map(value => Number(value));

    var counter = {};
    for (var value of a) {
        if (counter[value] === undefined) { counter[value] = 0; }
        counter[value]++;
    }

    var ans = 0;
    Object.keys(counter).forEach(i => {
        var index = Number(i);
        
        // 当該数字　=== index or 当該数字 === 0
        if (index !== counter[index]) {

            if (index < counter[index]) { ans += counter[index] - index }
            else { ans += counter[index] }
        }
    });

    console.log(ans)
});