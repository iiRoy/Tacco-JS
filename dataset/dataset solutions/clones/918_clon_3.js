var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataParts = rawData.trim().split(" ");

var valA = Number(dataParts[0]);
var valB = Number(dataParts[1]);
var valC = Number(dataParts[2]);
var valD = Number(dataParts[3]);

var productOfAB = valA * valB;
var sumOfCD = valC + valD;

var isProductOdd = (productOfAB % 2 !== 0);
var isSumOdd = (sumOfCD % 2 !== 0);

var decisionResult;
if (isProductOdd && isSumOdd) {
    decisionResult = "No";
} else {
    decisionResult = "Yes";
}

console.log(decisionResult);
