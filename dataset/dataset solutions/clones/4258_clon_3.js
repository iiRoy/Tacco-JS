var input = require("fs").readFileSync("/dev/stdin", "utf8");

var rows = input.trim().split('\n');
var N = parseInt(rows[0], 10);
var An = rows[1].split(' ');
var Bn = rows[2].split(' ');
var Cn = rows[3].split(' ');

var listA = new Array(N);
var listB = new Array(N);
var listC = new Array(N);

for (var i = 0; i < N; i++) {
    listA[i] = Number(An[i]);
    listB[i] = Number(Bn[i]);
    listC[i] = Number(Cn[i]);
}

function asc(a, b) {
    if (a === b) return 0;
    return a - b;
}

listA.sort(asc);
listB.sort(asc);
listC.sort(asc);

var sum = 0;
var indexA = 0;
var indexC = 0;
var countA = 0;
var countC = 0;

for (var iB = 0; iB < N; iB++) {
    var b = listB[iB];

    while (indexA < N && listA[indexA] < b) {
        indexA++;
        countA = indexA;
    }

    while (indexC < N && listC[indexC] <= b) {
        indexC++;
        countC = indexC;
    }

    var biggerC = N - countC;
    if (countA > 0 && biggerC > 0) {
        sum += countA * biggerC;
    } else {
        sum += 0;
    }
}

console.log(sum);