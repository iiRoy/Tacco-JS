'use strict'

((dataPayload) => {
    const processedLines = dataPayload.trim().split('\n');

    const taskDurations = processedLines[1].split(' ').map(Number);

    const alterationInstructions = processedLines.slice(3);

    const initialAggregateDuration = taskDurations.reduce((total, duration) => total + duration, 0);

    alterationInstructions.forEach(instructionString => {
        const [targetPosition, substituteValue] = instructionString.split(' ').map(Number);

        const originalDurationAtPosition = taskDurations[targetPosition - 1];

        const revisedAggregateDuration = (initialAggregateDuration - originalDurationAtPosition) + substituteValue;

        console.log(revisedAggregateDuration);
    });

})(require('fs').readFileSync('/dev/stdin', 'utf8'));