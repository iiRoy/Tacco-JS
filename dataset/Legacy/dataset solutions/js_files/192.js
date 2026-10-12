var C = ["A", "B", "C"];
function swap(A, i1, i2) {
    var tmp = A[i1];
    A[i1] = A[i2];
    A[i2] = tmp;
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.trim().split('\n');

var cups = [1,0,0];

var line;
while (line = lines.shift()) {
    var command = line.split(',');
    swap(cups, C.indexOf(command[0]), C.indexOf(command[1]));
}

for (var i = 0; i < cups.length; i++) {
    if (cups[i]) {
        console.log(C[i]);
        break;
    }
}