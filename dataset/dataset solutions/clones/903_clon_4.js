function addDigitsRecursive(s1, s2, index1, index2, carryAmount) {
    if (index1 < 0 && index2 < 0 && carryAmount === 0) {
        return "";
    }

    let digitOne = (index1 >= 0) ? parseInt(s1[index1], 10) : 0;
    let digitTwo = (index2 >= 0) ? parseInt(s2[index2], 10) : 0;

    let totalCurrent = digitOne + digitTwo + carryAmount;
    let nextCarry = Math.floor(totalCurrent / 10);
    let currentDigitResult = totalCurrent % 10;

    let previousResult = addDigitsRecursive(s1, s2, index1 - 1, index2 - 1, nextCarry);
    return previousResult + currentDigitResult.toString();
}

function sumLargeNumbers(operandA, operandB) {
    let stringFormA = String(operandA);
    let stringFormB = String(operandB);
    return addDigitsRecursive(stringFormA, stringFormB, stringFormA.length - 1, stringFormB.length - 1, 0);
}

function compareNumericStrings(textA, textB) {
    if (textA.length < textB.length) return -1;
    if (textA.length > textB.length) return 1;
    
    for (let charPosition = 0; charPosition < textA.length; charPosition++) {
        const charValA = parseInt(textA[charPosition], 10);
        const charValB = parseInt(textB[charPosition], 10);
        if (charValA < charValB) return -1;
        if (charValA > charValB) return 1;
    }
    return 0;
}

let dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineSegments = dataStream.trim().split("\n");

lineSegments.shift();

let firstSequence = lineSegments.shift().split(" ").map(Number);
firstSequence.sort((val1, val2) => val1 - val2);

lineSegments.shift();

let secondSequence = lineSegments.shift().split(" ").map(Number);

let targetValues = lineSegments.shift().split(" ");

let memoizedSums = new Map();
memoizedSums.set(0, "0");

let runningTotal = "0";

for (let currentElement of firstSequence) {
    runningTotal = sumLargeNumbers(runningTotal, currentElement);
    memoizedSums.set(currentElement, runningTotal);
}

secondSequence.forEach((currentQueryValue, queryIndex) => {
    let effectiveQueryValue = currentQueryValue;
    while (!memoizedSums.has(effectiveQueryValue)) {
        effectiveQueryValue--;
    }
    let computedSum = memoizedSums.get(effectiveQueryValue);
    let comparisonTarget = targetValues[queryIndex];

    let decisionOutcome = "No";
    if (compareNumericStrings(comparisonTarget, computedSum) <= 0) {
        decisionOutcome = "Yes";
    }
    console.log(decisionOutcome);
});