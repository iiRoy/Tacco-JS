var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputNumbers = rawData.trim().split("\n").map(Number);

function getAdjustedDifference(diffVal, modulusVal, limitVal) {
    let currentDiff = diffVal;
    if (currentDiff < 0) {
        currentDiff += modulusVal;
    }
    if (limitVal < currentDiff) {
        currentDiff -= modulusVal;
    }
    return currentDiff;
}

while (true) {
    var currentN = inputNumbers.shift();
    if (currentN === 0) {
        break;
    }

    if (currentN === 1) {
        console.log("");
        continue;
    }

    var isSquareModN = new Array(currentN).fill(false);

    for (let idx = 1; idx < currentN; idx++) {
        isSquareModN[(idx * idx) % currentN] = true;
    }

    var squareIndices = [];
    for (let idx = 0; idx < currentN; idx++) {
        if (isSquareModN[idx]) {
            squareIndices.push(idx);
        }
    }

    var halfNMinusOne = (currentN - 1) / 2;
    var resultCounts = new Array(Math.floor(halfNMinusOne) + 1).fill(0);

    for (let idx1 = 0; idx1 < squareIndices.length; idx1++) {
        for (let idx2 = idx1 + 1; idx2 < squareIndices.length; idx2++) {
            const val1 = squareIndices[idx1];
            const val2 = squareIndices[idx2];

            let diff1 = val1 - val2;
            let adjustedDiff1 = getAdjustedDifference(diff1, currentN, halfNMinusOne);
            resultCounts[adjustedDiff1]++;

            let diff2 = val2 - val1;
            let adjustedDiff2 = getAdjustedDifference(diff2, currentN, halfNMinusOne);
            resultCounts[adjustedDiff2]++;
        }
    }

    for (let outputIdx = 1; outputIdx < resultCounts.length; outputIdx++) {
        console.log(resultCounts[outputIdx] * 2);
    }
}
