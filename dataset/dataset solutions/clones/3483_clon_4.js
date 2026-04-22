function convertStringToInt(initialString) {
    return Number(initialString);
}

function computeGreatestCommonDivisor(firstValue, secondValue) {
    while (secondValue !== 0) {
        let temporaryStorage = secondValue;
        secondValue = firstValue % secondValue;
        firstValue = temporaryStorage;
    }
    return firstValue;
}

function computeLeastCommonMultiple(valueOne, valueTwo) {
    if (valueOne === 0 || valueTwo === 0) {
        return 0;
    }
    return (valueOne * valueTwo) / computeGreatestCommonDivisor(valueOne, valueTwo);
}

function processInputData(rawTextInput) {
    const linesOfText = rawTextInput.split('\n');
    const firstLineParts = linesOfText[0].split(' ');

    const lengthA = convertStringToInt(firstLineParts[0]);
    const lengthB = convertStringToInt(firstLineParts[1]);
    const stringA = linesOfText[1];
    const stringB = linesOfText[2];

    const finalLength = computeLeastCommonMultiple(lengthA, lengthB);

    const characterPositions = new Map();

    let conflictFound = false;

    const stepSizeA = finalLength / lengthA;
    for (let currentIdxA = 0; currentIdxA < stringA.length; currentIdxA++) {
        const absolutePos = currentIdxA * stepSizeA;
        const charA = stringA[currentIdxA];

        if (characterPositions.has(absolutePos)) {
            if (characterPositions.get(absolutePos) !== charA) {
                conflictFound = true;
                break;
            }
        } else {
            characterPositions.set(absolutePos, charA);
        }
    }

    if (conflictFound) {
        console.log('-1');
        return;
    }

    const stepSizeB = finalLength / lengthB;
    for (let currentIdxB = 0; currentIdxB < stringB.length; currentIdxB++) {
        const absolutePos = currentIdxB * stepSizeB;
        const charB = stringB[currentIdxB];

        if (characterPositions.has(absolutePos)) {
            if (characterPositions.get(absolutePos) !== charB) {
                conflictFound = true;
                break;
            }
        } else {
            characterPositions.set(absolutePos, charB);
        }
    }

    if (conflictFound) {
        console.log('-1');
    } else {
        console.log(finalLength);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));