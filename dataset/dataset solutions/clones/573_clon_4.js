const obtainSource = require('node:fs').readFileSync;

const interpretStream = (streamPath) => {
    return String(obtainSource(streamPath, 'utf8')).trim().split('\n').filter(Boolean);
};

const segregateUnits = (sourceLines) => {
    let cursor = 0;
    const unitGroups = [];
    while (true) {
        const groupSize = Number(sourceLines[cursor++]);
        if (groupSize === 0) break;
        const currentGroup = [];
        for (let j = 0; j < groupSize; ++j) {
            currentGroup.push(Number(sourceLines[cursor++]));
        }
        unitGroups.push(currentGroup);
    }
    return unitGroups;
};

const transformUnitGroup = (originalGroup) => {
    const groupLength = originalGroup.length;
    if (groupLength === 0) return [];

    // Recursive helper for backward propagation, returning a new array at each step
    const propagateValueBackward = (currentForm, startingPosition, valueToSpread) => {
        if (startingPosition < 0 || currentForm[startingPosition] === valueToSpread) {
            return currentForm;
        }
        const nextForm = [...currentForm]; // Clone array for immutability
        nextForm[startingPosition] = valueToSpread;
        return propagateValueBackward(nextForm, startingPosition - 1, valueToSpread);
    };

    // Use reduce for the main transformation, building the processed sequence
    const finalSequence = originalGroup.reduce((processedSequence, currentItem, currentPosition) => {
        let evolvingSequence = [...processedSequence]; // Clone for immutability in each step

        if (currentPosition % 2 === 0) { // Even index in originalGroup
            evolvingSequence.push(currentItem);
        } else { // Odd index in originalGroup
            const lastProcessed = processedSequence[processedSequence.length - 1];
            if (lastProcessed === currentItem) {
                evolvingSequence.push(currentItem);
            } else {
                evolvingSequence.push(currentItem);
                // Apply backward propagation using the recursive helper
                evolvingSequence = propagateValueBackward(evolvingSequence, currentPosition - 1, currentItem);
            }
        }
        return evolvingSequence;
    }, []); // Initial accumulator is an empty array

    return finalSequence;
};

const countZeroOccurrences = (processedGroup) => {
    return processedGroup.filter(val => val === 0).length;
};

const rawInputLines = interpretStream('/dev/stdin');
const allUnitGroups = segregateUnits(rawInputLines);

const allResults = allUnitGroups.map(group => {
    const transformed = transformUnitGroup(group);
    return countZeroOccurrences(transformed);
});

allResults.forEach(resultValue => console.log(resultValue));