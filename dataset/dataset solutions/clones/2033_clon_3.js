function splitInputIntoLines(rawText) {
    return rawText.split("\n").map((lineSegment) => lineSegment.trim());
}

function splitLineBySpace(lineContent) {
    return lineContent.split(" ").map((segment) => segment.trim());
}

function parseLineToIntegers(lineContent) {
    return lineContent.split(" ").map((segment) => parseInt(segment.trim(), 10));
}

const numericSortAsc = (valA, valB) => valA - valB;

function processChallengeData(rawInputString) {
    const processedNumericLines = splitInputIntoLines(rawInputString).map(parseLineToIntegers);

    const [countXItems, countYItems, rawA, rawB, rawC] = processedNumericLines[0];
    const idxPMax = rawA - 1;
    const idxQMax = rawB - 1;
    const idxRMax = rawC - 1;

    const pValues = processedNumericLines[1];
    const qValues = processedNumericLines[2];
    const rValues = processedNumericLines[3];

    pValues.sort(numericSortAsc);
    qValues.sort(numericSortAsc);
    rValues.sort(numericSortAsc);

    let cumulativeSum = 0;

    let pPointer = idxPMax - countXItems + 1;
    for (let currentIdxP = 0; currentIdxP < countXItems; currentIdxP++) {
        cumulativeSum += pValues[idxPMax - currentIdxP];
    }

    let qPointer = idxQMax - countYItems + 1;
    for (let currentIdxQ = 0; currentIdxQ < countYItems; currentIdxQ++) {
        cumulativeSum += qValues[idxQMax - currentIdxQ];
    }

    for (let currentIdxR = idxRMax; currentIdxR >= 0; currentIdxR--) {
        const currentRValue = rValues[currentIdxR];

        const pSelectionExhausted = pPointer > idxPMax;
        const qSelectionExhausted = qPointer > idxQMax;

        if (pSelectionExhausted && qSelectionExhausted) {
            break;
        }

        if (pSelectionExhausted) {
            const smallestQValueInSelection = qValues[qPointer];
            if (currentRValue > smallestQValueInSelection) {
                cumulativeSum += currentRValue - smallestQValueInSelection;
                qPointer++;
                continue;
            } else {
                break;
            }
        }

        if (qSelectionExhausted) {
            const smallestPValueInSelection = pValues[pPointer];
            const comparisonTargetValue = qValues[pPointer];
            if (currentRValue > comparisonTargetValue) {
                cumulativeSum += currentRValue - smallestPValueInSelection;
                pPointer++;
                continue;
            } else {
                break;
            }
        }

        const smallestPValueInSelection = pValues[pPointer];
        const smallestQValueInSelection = qValues[qPointer];
        const overallMinimumSelectedValue = Math.min(smallestPValueInSelection, smallestQValueInSelection);

        if (currentRValue > overallMinimumSelectedValue) {
            if (smallestQValueInSelection > smallestPValueInSelection) {
                cumulativeSum += currentRValue - smallestPValueInSelection;
                pPointer++;
            } else {
                cumulativeSum += currentRValue - smallestQValueInSelection;
                qPointer++;
            }
        } else {
            break;
        }
    }

    console.log(cumulativeSum);
}

processChallengeData(require('fs').readFileSync('/dev/stdin', 'utf8'));
