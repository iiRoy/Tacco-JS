var inputLines = [];
var ioHandler = require('readline');

var lineReader = ioHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineReader.on('line', function (x) {
    inputLines.push(x);
});

lineReader.on('close', function () {
    const firstLineRaw = inputLines.shift();
    const firstLineParts = firstLineRaw.split(" ");
    const totalElements = parseInt(firstLineParts[0], 10);
    const elementsToAverage = parseInt(firstLineParts[1], 10);
    const maxElementsForCombinations = parseInt(firstLineParts[2], 10);

    const valueArray = new Array(totalElements);
    const secondLineRaw = inputLines.shift();
    const secondLineTokens = secondLineRaw.split(" ");
    for (let idx = 0; idx < totalElements; idx++) {
        valueArray[idx] = parseInt(secondLineTokens[idx], 10);
    }

    valueArray.sort((valA, valB) => valB - valA); // Sort in descending order

    let sumOfTopElements = 0;
    const valueCounts = {}; // Stores frequency of each number

    for (let idx = 0; idx < totalElements; idx++) {
        if (idx < elementsToAverage) {
            sumOfTopElements += valueArray[idx];
        }
        valueCounts[valueArray[idx]] = (valueCounts[valueArray[idx]] || 0) + 1;
    }
    const calculatedAverage = sumOfTopElements / elementsToAverage;
    console.log(calculatedAverage);

    let currentCount = 0;
    let totalCombinations; // Variable to store the final combination count

    const firstLargestValue = valueArray[0];
    // This refers to the (elementsToAverage + 1)-th largest value (0-indexed)
    const aPlusOneThLargestValue = valueArray[elementsToAverage]; 

    if (firstLargestValue !== aPlusOneThLargestValue) {
        totalCombinations = 1;
        const distinctValueCount = Object.keys(valueCounts).length;
        for (let idx = 0; idx < distinctValueCount; idx++) {
            const currentVal = valueArray[idx];
            const currentValFrequency = valueCounts[currentVal];

            if (currentValFrequency >= 2) {
                const remainingNeededForA = elementsToAverage - currentCount;
                const numToPick = Math.min(currentValFrequency, remainingNeededForA);
                totalCombinations *= calculateCombination(currentValFrequency, numToPick);
                currentCount += currentValFrequency;
            } else {
                currentCount += currentValFrequency;
            }
        }
    } else {
        totalCombinations = 0;
        const MAGIC_COMBINATION_BASE = 50; // Preserving the hardcoded constant from original
        for (let k = 1; k <= maxElementsForCombinations; k++) {
            totalCombinations += calculateCombination(MAGIC_COMBINATION_BASE, k);
        }
    }
    console.log(totalCombinations);

});

function calculatePermutation(numN, numR) {
    let resultValue = 1;
    for (let iter = 0; iter < numR; iter++) {
        resultValue *= (numN - iter);
    }
    return resultValue;
}

function calculateCombination(numN, numR) {
    // Guard clauses for robustness, preserving original behavior for valid inputs
    if (numR < 0 || numR > numN) {
        return 0;
    }
    if (numR === 0 || numR === numN) {
        return 1;
    }
    // Optimization: C(n, r) = C(n, n-r)
    if (numR > numN / 2) {
        numR = numN - numR;
    }
    
    // The original logic for combination is permutation(n, r) / permutation(r, r)
    // This is mathematically equivalent to n! / (r! * (n-r)!)
    return calculatePermutation(numN, numR) / calculatePermutation(numR, numR);
}
