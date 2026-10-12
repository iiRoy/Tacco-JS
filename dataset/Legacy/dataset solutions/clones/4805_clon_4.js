'use strict'

function ProcessInput(sourceData) {
    const lineSegments = sourceData.trim().split('\n');

    const countA = Number(lineSegments[0]);

    const initialDurations = lineSegments[1].split(' ').map(val => Number(val));

    const countB = Number(lineSegments[2]);

    const modificationInstructions = lineSegments.slice(3).map(line =>
        line.split(' ').map(val => Number(val))
    );

    modificationInstructions.forEach(parsedInstruction => {
        const targetIndex = parsedInstruction[0] - 1;
        const newValue = parsedInstruction[1];

        const currentDurations = initialDurations.map((duration, idx) =>
            idx === targetIndex ? newValue : duration
        );

        const computedTotal = currentDurations.reduce((accumulator, current) => accumulator + current, 0);

        console.log(computedTotal);
    });
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
