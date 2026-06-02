var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

var dataRows = rawData.split('\n');
var arraySize = Number(dataRows[0]);

function parseAndConvert(inputLine) {
    return inputLine.split(' ').map(function(str) {
        return Number(str);
    });
}

var numArrA = parseAndConvert(dataRows[1]);
var numArrB = parseAndConvert(dataRows[2]);
var numArrC = parseAndConvert(dataRows[3]);

function numericSort(val1, val2) {
    return val1 - val2;
}

numArrA.sort(numericSort);
numArrB.sort(numericSort);
numArrC.sort(numericSort);

var totalSum = 0;
var pointerA = 0;
var pointerC = 0;

for (var currentBIndex = 0; currentBIndex < arraySize; currentBIndex++) {
    var currentBValue = numArrB[currentBIndex];

    while (pointerA < arraySize && numArrA[pointerA] < currentBValue) {
        pointerA++;
    }
    var countLessThanB = pointerA;

    while (pointerC < arraySize && numArrC[pointerC] <= currentBValue) {
        pointerC++;
    }
    var countLessEqualB = pointerC;

    var countGreaterThanB = arraySize - countLessEqualB;

    totalSum += countLessThanB * countGreaterThanB;
}

console.log(totalSum);
