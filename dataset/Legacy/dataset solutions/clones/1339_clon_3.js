var rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
//var rawData = 1463616;
var originalNum = parseInt(rawData);
var currentNum = originalNum;

var factorList = [];
const initialDivisorForEvens = 2;

function processDivisor(numberToFactor, divisorValue, collectedFactors) {
    let remainingNumber = numberToFactor;
    while (remainingNumber % divisorValue === 0) {
        collectedFactors.push(divisorValue);
        remainingNumber /= divisorValue;
    }
    return remainingNumber;
}

currentNum = processDivisor(currentNum, initialDivisorForEvens, factorList);

const oddDivisorStep = 2;

for (var divisorCandidate = 3; divisorCandidate <= Math.sqrt(currentNum); divisorCandidate += oddDivisorStep) {
    currentNum = processDivisor(currentNum, divisorCandidate, factorList);
}

if (currentNum > 1) {
    factorList.push(currentNum);
}

console.log(originalNum + ': ' + factorList.join(' '));
