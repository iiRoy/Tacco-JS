let accumulatedInput = '';

process.stdin.on('data', segmentChunk => {
    accumulatedInput += segmentChunk.toString();
});

process.stdin.on('end', () => {
    processNumericalSequence(accumulatedInput);
});

function processNumericalSequence(sequenceString) {
    const numericComponents = sequenceString.split(' ').map(Number);

    const [lengthOverall, activeInterval, inactiveInterval] = numericComponents;

    if (activeInterval + inactiveInterval === 0) {
        console.log(0);
        return;
    }

    const cycleTotalDuration = activeInterval + inactiveInterval;

    const fullCycleRepetitions = (lengthOverall / cycleTotalDuration) | 0;

    const remainingSpanLength = lengthOverall % cycleTotalDuration;

    const cumulativeActiveDuration =
        (fullCycleRepetitions * activeInterval) +
        ((remainingSpanLength < activeInterval) ? remainingSpanLength : activeInterval);

    console.log(cumulativeActiveDuration);
}