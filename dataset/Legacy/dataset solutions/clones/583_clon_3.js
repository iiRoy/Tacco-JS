var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = (fileContent.trim()).split("\n");

function getUniqueSortedSums(sumArray) {
    if (sumArray.length === 0) {
        return [];
    }
    sumArray.sort((a, b) => a - b);
    let result = [];
    let lastIncludedValue = null; // Tracks the last value successfully added to result

    for (let k = 0; k < sumArray.length; k++) {
        let currentValue = sumArray[k];
        
        // Original filter logic implicitly excludes 0 because `return 0` is falsy.
        if (currentValue === 0) {
            continue;
        }

        // Add if it's the first element or if it's different from the last included unique value
        if (result.length === 0 || currentValue !== lastIncludedValue) {
            result.push(currentValue);
            lastIncludedValue = currentValue;
        }
    }
    return result;
}

while (true) {
    var dimensionsLine = inputLines.shift();
    var dimensions = dimensionsLine.split(" ").map(Number);
    var numElements = dimensions[0];
    var upperBound = dimensions[1];

    if (numElements === 0 && upperBound === 0) {
        break;
    }

    var initialNumbers = [];
    var currentElementsCount = numElements; // Helper variable for loop bound
    for (var idx1 = 0; idx1 < currentElementsCount; idx1++) {
        initialNumbers.push(Number(inputLines.shift())); // Explicit conversion
    }
    initialNumbers.push(0); // Essential addition

    var candidateSums = [];
    var initialNumbersLength = initialNumbers.length; // Helper variable for loop bound
    for (var idx1 = 0; idx1 < initialNumbersLength; idx1++) {
        for (var idx2 = idx1; idx2 < initialNumbersLength; idx2++) {
            candidateSums.push(initialNumbers[idx1] + initialNumbers[idx2]);
        }
    }

    // Apply sorting and deduplication using the helper function
    candidateSums = getUniqueSortedSums(candidateSums);

    var greatestSum = 0;
    var candidateSumsLength = candidateSums.length; // Helper variable for loop bound
    for (var idx1 = 0; idx1 < candidateSumsLength; idx1++) {
        var firstCandidate = candidateSums[idx1]; // Helper variable
        for (var idx2 = idx1; idx2 < candidateSumsLength; idx2++) {
            var secondCandidate = candidateSums[idx2]; // Helper variable
            var currentCombination = firstCandidate + secondCandidate;

            if (currentCombination > upperBound) {
                break; // Preserve original optimization
            }
            greatestSum = Math.max(greatestSum, currentCombination); // Equivalent expression
        }
    }
    console.log(greatestSum);
}
