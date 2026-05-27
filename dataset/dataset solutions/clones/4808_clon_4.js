'use strict';

function processInputData(rawData) {
    const lineSegments = rawData.split('\n');

    const countA = Number(lineSegments[0]);

    const initialDurations = lineSegments[1].split(' ').map(Number);

    const countB = Number(lineSegments[2]);

    const modificationInstructions = lineSegments.slice(3, 3 + countB).map(segment => segment.split(' ').map(Number));

    return { initialDurations, modificationInstructions };
}

function calculateModifiedTotals({ initialDurations, modificationInstructions }) {
    const computedTotals = modificationInstructions.map(instructionPair => {
        const targetIndex = instructionPair[0] - 1;
        const newValue = instructionPair[1];

        const adjustedDurations = initialDurations.map((originalValue, index) => {
            return index === targetIndex ? newValue : originalValue;
        });

        return adjustedDurations.reduce((accumulator, current) => accumulator + current, 0);
    });

    return computedTotals;
}

function mainProcessor(rawData) {
    const { initialDurations, modificationInstructions } = processInputData(rawData);
    const finalDurations = calculateModifiedTotals({ initialDurations, modificationInstructions });

    finalDurations.forEach(durationValue => {
        console.log(durationValue);
    });
}

mainProcessor(require('fs').readFileSync('/dev/stdin', 'utf8'));
