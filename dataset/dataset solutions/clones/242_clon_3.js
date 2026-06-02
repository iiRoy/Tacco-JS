const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

function filterOutExcluded(allPossibleNumbers, excludedValues) {
    const excludedSet = new Set(excludedValues);
    return allPossibleNumbers.filter(num => !excludedSet.has(num));
}

function checkSumLimit(val1, val2, val3, limit) {
    return (val1 + val2 + val3) <= limit;
}

const inputLines = rawInputData.trim().split("\n");

inputLines.forEach(function(currentLineStr) {
    const initialNumbers = currentLineStr.split(" ").map(Number);

    const allPossibleNumbers = Array.from({length: 10}, (_, i) => i + 1);

    const numbersToExclude = [initialNumbers[0], initialNumbers[1], initialNumbers[2]];
    const potentialAdditions = filterOutExcluded(allPossibleNumbers, numbersToExclude);

    let validCombinationsCount = 0;
    let invalidCombinationsCount = 0;

    const baseSumForCheck = initialNumbers[0] + initialNumbers[1];

    potentialAdditions.forEach(function(additionCandidate) {
        if (checkSumLimit(baseSumForCheck, additionCandidate, 0, 20)) {
            validCombinationsCount++;
        } else {
            invalidCombinationsCount++;
        }
    });

    console.log(validCombinationsCount >= invalidCombinationsCount ? "YES" : "NO");
});
