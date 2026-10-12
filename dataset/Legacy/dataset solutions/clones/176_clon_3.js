function CombinationsGenerator() {
    var resultContainer = {};

    var firstComponentParts = "123,234,345,456,567,678,789,111,222,333,444,555,666,777,888,999".split(",");
    var secondComponentParts = "11,22,33,44,55,66,77,88,99".split(",");

    function processAndSortDigits(inputString) {
        return inputString.split("").map(Number).sort(function(a, b) {
            return a - b;
        }).join("");
    }

    var firstComponentCount = firstComponentParts.length;
    var secondComponentCount = secondComponentParts.length;

    for (var idxA1 = 0; idxA1 < firstComponentCount; idxA1++) {
        for (var idxA2 = 0; idxA2 < firstComponentCount; idxA2++) {
            for (var idxA3 = 0; idxA3 < firstComponentCount; idxA3++) {
                for (var idxA4 = 0; idxA4 < firstComponentCount; idxA4++) {
                    for (var idxB = 0; idxB < secondComponentCount; idxB++) {
                        var rawCombination = firstComponentParts[idxA1] +
                                             firstComponentParts[idxA2] +
                                             firstComponentParts[idxA3] +
                                             firstComponentParts[idxA4] +
                                             secondComponentParts[idxB];

                        var sortedCombinationKey = processAndSortDigits(rawCombination);
                        resultContainer[sortedCombinationKey] = true;
                    }
                }
            }
        }
    }
    return resultContainer;
}

var precomputedSolutions = CombinationsGenerator();

var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = rawInputData.trim().split("\n");

function calculateDigitFrequencies(digitArray) {
    // Replicate original behavior: array of size 9 (indices 0-8).
    // If a digit '9' appears, frequencies[9] will be undefined,
    // and frequencies[9]++ will result in NaN, matching original behavior.
    var frequencies = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var k = 0; k < digitArray.length; k++) {
        var digitValue = digitArray[k];
        frequencies[digitValue]++;
    }
    return frequencies;
}

function findMaxInArray(numArray) {
    var currentMax = 0;
    var hasNaN = false;
    for (var k = 0; k < numArray.length; k++) {
        var val = numArray[k];
        if (isNaN(val)) {
            hasNaN = true;
            break;
        }
        if (val > currentMax) {
            currentMax = val;
        }
    }
    return hasNaN ? NaN : currentMax;
}

while (true) {
    if (inputLines.length === 0) {
        break;
    }

    var currentInputLine = inputLines.shift();
    var possibleAppends = [];

    var maxAppendDigit = 9;
    for (var digitToAppend = 0; digitToAppend < maxAppendDigit; digitToAppend++) {
        var initialDigits = currentInputLine.split("").map(Number);
        var modifiedDigits = initialDigits.slice();
        modifiedDigits.push(digitToAppend);

        modifiedDigits.sort(function(a, b) {
            return a - b;
        });

        var digitFrequencies = calculateDigitFrequencies(modifiedDigits);
        var maxFrequency = findMaxInArray(digitFrequencies);

        if (maxFrequency >= 5) {
            continue;
        }

        var sortedModifiedDigitsKey = modifiedDigits.join("");
        if (precomputedSolutions.hasOwnProperty(sortedModifiedDigitsKey)) {
            possibleAppends.push(digitToAppend);
        }
    }

    if (possibleAppends.length === 0) {
        console.log("0");
    } else {
        console.log(possibleAppends.join(" "));
    }
}
