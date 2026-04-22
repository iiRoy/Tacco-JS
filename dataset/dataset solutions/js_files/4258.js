var input = require("fs").readFileSync("/dev/stdin", "utf8");

var lines = input.split('\n');
var N = Number(lines[0]);
var An = lines[1].split(' ');
var Bn = lines[2].split(' ');
var Cn = lines[3].split(' ');

var listA = [];
var listB = [];
var listC = [];
for (var i = 0; i < N; i++) {
    listA.push(Number(An[i]));
    listB.push(Number(Bn[i]));
    listC.push(Number(Cn[i]));
}
function asc(a, b) { return a - b; }
listA.sort(asc);
listB.sort(asc);
listC.sort(asc);

var sum = 0;
var iA = 0;
var iC = 0;
var countA = 0;
var countC = 0;
for (var iB = 0; iB < N; iB++) {
    var b = listB[iB];
    for (var i = iA; i < N; i++) {
        var a = listA[i];
        if (b <= a) {
            break;
        } else {
            iA = i;
            countA = i + 1;
        }
    }
    for (var i = iC; i < N; i++) {
        var c = listC[i];
        if (b < c) {
            break;
        } else {
            iC = i;
            countC = i + 1;
        }
    }
    sum += countA * (N - countC);
}

console.log(sum);