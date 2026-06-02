const parseInteger = (strVal) => parseInt(strVal, 10);

function greatestCommonDivisor(numA, numB) {
    let currentA = numA;
    let currentB = numB;
    while (currentB !== 0) {
        let remainder = currentA % currentB;
        currentA = currentB;
        currentB = remainder;
    }
    return currentA;
}

const leastCommonMultiple = (valA, valB) => (valA * valB) / greatestCommonDivisor(valA, valB);

function processInput(rawData) {
    const inputLines = rawData.split('\n');
    const firstLineData = inputLines[0].split(' ');

    const lenA = parseInteger(firstLineData[0]);
    const lenB = parseInteger(firstLineData[1]);
    const strA = inputLines[1];
    const strB = inputLines[2];

    const finalLength = leastCommonMultiple(lenA, lenB);
    let operationStatus = true;

    const mergedSequence = new Array(finalLength).fill('');

    const stepA = finalLength / lenA;
    mergedSequence[0] = strA[0];
    for (let idxA = 1; idxA < strA.length; idxA++) {
        mergedSequence[idxA * stepA] = strA[idxA];
    }

    if (mergedSequence[0] !== strB[0]) {
        console.log('-1');
    } else {
        const stepB = finalLength / lenB;
        for (let idxB = 1; idxB < strB.length; idxB++) {
            const currentTargetIndex = idxB * stepB;
            const charInMerged = mergedSequence[currentTargetIndex];
            const charInStrB = strB[idxB];

            const EMPTY_CHAR = '';

            if (charInMerged !== EMPTY_CHAR && charInMerged !== charInStrB) {
                console.log('-1');
                operationStatus = false;
                break;
            }
        }
    }

    if (operationStatus) {
        console.log(finalLength);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
