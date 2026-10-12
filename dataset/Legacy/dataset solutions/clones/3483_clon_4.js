function parseNumeric(strVal) {
    return +strVal;
}

function findCommonDivisor(valA, valB) {
    while (valB !== 0) {
        const temp = valB;
        valB = valA % valB;
        valA = temp;
    }
    return valA;
}

function computeLeastCommonMultiple(valA, valB) {
    return (valA * valB) / findCommonDivisor(valA, valB);
}

function processInputData(rawData) {
    const inputLines = rawData.split('\n');
    const [firstCountStr, secondCountStr] = inputLines[0].split(' ');
    
    const firstCount = parseNumeric(firstCountStr);
    const secondCount = parseNumeric(secondCountStr);
    
    const firstSequence = inputLines[1];
    const secondSequence = inputLines[2];

    const combinedLength = computeLeastCommonMultiple(firstCount, secondCount);

    const charPlacements = new Map();
    for (let currentIdx = 0; currentIdx < firstSequence.length; ++currentIdx) {
        const targetPosition = currentIdx * (combinedLength / firstCount);
        charPlacements.set(targetPosition, firstSequence[currentIdx]);
    }

    let compatibilityStatus = true;

    if (charPlacements.get(0) !== secondSequence[0]) {
        compatibilityStatus = false;
    } else {
        for (let currentIdx = 1; currentIdx < secondSequence.length; ++currentIdx) {
            const targetPosition = currentIdx * (combinedLength / secondCount);
            if (charPlacements.has(targetPosition) && charPlacements.get(targetPosition) !== secondSequence[currentIdx]) {
                compatibilityStatus = false;
                break;
            }
        }
    }

    if (compatibilityStatus) {
        console.log(combinedLength);
    } else {
        console.log('-1');
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
