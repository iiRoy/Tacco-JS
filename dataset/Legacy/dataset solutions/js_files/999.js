process.stdin.resume();
process.stdin.setEncoding('utf8');

// Here your code !
var input = require('fs').readFileSync('/dev/stdin', 'utf8')
input = input.trim().split('\n').map(Number);

var n = input[0]
var rList = input.slice(1);
var result = 0

for (var i = 0; i < rList.length; i ++) {
    if (i + 1 === n) {
        break;
    }
    
    for (var j = 0; j < rList.length; j ++) {
        if (i === j) {
            continue;
        }

        var calc = rList[i] - rList[j]
        if (result < calc) {
            result = calc;
        }
    }
}
console.log(result)