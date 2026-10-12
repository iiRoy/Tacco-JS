var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

function parseNumericInput(inputString) {
    return inputString.trim().split("\n").map(Number);
}

function getSquareModNFlags(limitN) {
    const flags = new Array(limitN).fill(false);
    for (let k = 1; k < limitN; k++) {
        flags[(k * k) % limitN] = true;
    }
    return flags;
}

function getTrueIndices(flagsArray) {
    const indices = [];
    for (let k = 0; k < flagsArray.length; k++) {
        if (flagsArray[k]) {
            indices.push(k);
        }
    }
    return indices;
}

function getNormalizedDifferenceIndex(valA, valB, modulusValue, maxRelevantIndex) {
    let initialDifference = valA - valB;
    let positiveDifference = (initialDifference < 0) ? initialDifference + modulusValue : initialDifference;
    return (maxRelevantIndex < positiveDifference) ? modulusValue - positiveDifference : positiveDifference;
}

var numericInputs = parseNumericInput(fileContent);

while (true) {
    var currentN = numericInputs.shift();

    if (currentN === 0) {
        break;
    }

    const isSquareModN = getSquareModNFlags(currentN);

    const squareIndices = getTrueIndices(isSquareModN);

    const halfNMinusOne = (currentN - 1) / 2;
    const resultCounts = new Array(halfNMinusOne + 1).fill(0);

    for (let outerIdx = 0; outerIdx < squareIndices.length; outerIdx++) {
        for (let innerIdx = outerIdx + 1; innerIdx < squareIndices.length; innerIdx++) {
            const val1 = squareIndices[outerIdx];
            const val2 = squareIndices[innerIdx];

            const finalIndex = getNormalizedDifferenceIndex(val1, val2, currentN, halfNMinusOne);
            resultCounts[finalIndex] += 2;
        }
    }

    resultCounts.shift();

    for (const countValue of resultCounts) {
        console.log(countValue);
    }
}
