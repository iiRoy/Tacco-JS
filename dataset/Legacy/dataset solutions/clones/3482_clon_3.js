function greatestCommonDivisor(valA, valB) {
    let currentA = valA;
    let currentB = valB;
    while (currentB !== 0) {
        const remainder = currentA % currentB;
        currentA = currentB;
        currentB = remainder;
    }
    return currentA;
}

function generateIndices(count, totalSpan) {
    return Array.from({ length: count }, (_, index) => (index * totalSpan) / count);
}

function checkAlignment(lenStrA, lenStrB, strA, strB, currentCommonLength) {
    const indicesA = generateIndices(lenStrA, currentCommonLength);
    const indicesB = generateIndices(lenStrB, currentCommonLength);

    for (let charPosition = 0; charPosition < currentCommonLength; charPosition++) {
        const charIndexA = indicesA.indexOf(charPosition);
        const charIndexB = indicesB.indexOf(charPosition);

        if (charIndexA >= 0 && charIndexB >= 0) {
            if (strA[charIndexA] !== strB[charIndexB]) {
                return false;
            }
        }
    }
    return true;
}

function processInput(inputString) {
    const lines = inputString.split("\n");
    const firstLineParts = lines[0].split(" ");
    const lenStrA = Number(firstLineParts[0]);
    const lenStrB = Number(firstLineParts[1]);
    const strA = lines[1];
    const strB = lines[2];

    if (strA === strB) {
        console.log(lenStrA);
        return;
    }

    if (lenStrA % lenStrB === 0 || lenStrB % lenStrA === 0) {
        console.log(-1);
        return;
    }

    const commonDivisor = greatestCommonDivisor(lenStrA, lenStrB);
    const leastCommonMultiple = (lenStrA * lenStrB) / commonDivisor;

    const MAX_ITERATION_LIMIT = Math.pow(10, 5);

    let currentCommonLength = leastCommonMultiple;

    while (currentCommonLength < MAX_ITERATION_LIMIT) {
        if (checkAlignment(lenStrA, lenStrB, strA, strB, currentCommonLength)) {
            break;
        }
        currentCommonLength += leastCommonMultiple;
    }

    console.log(currentCommonLength);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
