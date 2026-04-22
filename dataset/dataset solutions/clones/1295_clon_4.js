'use strict'

const calculateTriplets = (limitValue, sumTarget) => {
    let matchingSets = 0;
    if (limitValue < 3 || sumTarget < 6) { // Minimum 3 distinct numbers (1,2,3) sum to 6
        return 0;
    }

    for (let firstElement = 1; firstElement <= limitValue - 2; firstElement++) {
        for (let secondElement = firstElement + 1; secondElement <= limitValue - 1; secondElement++) {
            const thirdElement = sumTarget - firstElement - secondElement;

            if (thirdElement > secondElement && thirdElement <= limitValue) {
                matchingSets++;
            }
        }
    }
    return matchingSets;
};

const manageInput = (rawText) => {
    const textLines = rawText.trim().split('\n');
    const finalCounts = [];

    for (const currentLine of textLines) {
        if (currentLine === '0 0') {
            break;
        }
        if (!currentLine.trim()) {
            continue;
        }

        const numberPair = currentLine.split(' ').map(str => parseInt(str, 10));
        const currentN = numberPair[0];
        const currentX = numberPair[1];

        if (isNaN(currentN) || isNaN(currentX)) {
            finalCounts.push(0);
            continue;
        }

        const currentLineResult = calculateTriplets(currentN, currentX);
        finalCounts.push(currentLineResult);
    }

    return finalCounts.join('\n');
};

console.log(manageInput(require('fs').readFileSync('/dev/stdin', 'utf8')));