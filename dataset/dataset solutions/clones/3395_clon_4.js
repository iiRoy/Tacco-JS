"use strict";

const solveProblem = (textPayload) => {
    const textLines = textPayload.split('\n');
    const itemLimit = Number(textLines[0]);
    const valueSequence = textLines[1].split(/\s+/).map(Number).filter(v => !isNaN(v)).slice(0, itemLimit);

    const occurrenceRegister = valueSequence.reduce((acc, num) => {
        acc[num] = (acc[num] || 0) + 1;
        return acc;
    }, {});

    let overallTally = 0;

    while (Object.keys(occurrenceRegister).length > 0) {
        const primaryElement = Object.keys(occurrenceRegister)[0];
        // The original code removes all occurrences of the 'init' element
        // before calling 'rec'. This is mimicked by deleting the key.
        delete occurrenceRegister[primaryElement]; 

        const [leftPath, rightPath] = traverseAndPair(parseInt(primaryElement), occurrenceRegister);
        overallTally += Math.min(leftPath, rightPath);
    }

    console.log(overallTally);
};

const traverseAndPair = (currentValue, currentRegister) => {
    let leftCount = 1; // Represents the current node itself
    let rightCount = 0;

    const powerOfTwoExponents = Array.from({ length: 31 }, (_, i) => i + 1); // Exponents for 2^1 to 2^31

    for (const exp of powerOfTwoExponents) {
        const powerOfTwo = 1 << exp;
        const potentialPartner = powerOfTwo - currentValue;

        if (potentialPartner > 0) {
            // Check if potentialPartner exists and decrement its count
            if (decrementAndCheck(currentRegister, potentialPartner)) {
                const [subLeft, subRight] = traverseAndPair(potentialPartner, currentRegister);
                leftCount += subRight;
                rightCount += subLeft;
            }
        }
    }
    return [leftCount, rightCount];
};

const decrementAndCheck = (register, keyVal) => {
    if (register[keyVal] && register[keyVal] > 0) {
        register[keyVal]--;
        if (register[keyVal] === 0) {
            delete register[keyVal];
        }
        return true;
    }
    return false;
};

solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));