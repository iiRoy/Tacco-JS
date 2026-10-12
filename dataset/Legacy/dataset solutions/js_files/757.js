var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr = input.trim().split("\n");
while (arr.shift() != 0) {
    var a = arr.shift().split(" ").map(Number);
    a.sort((a, b) => a - b);
    var min = Infinity;
    a.reduce((a, b) => {
        min = Math.min(min, Math.abs(a - b));
        return b;
    });
    console.log(min);
}