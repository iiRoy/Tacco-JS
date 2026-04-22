let inputAccumulator = '';

process.stdin.on('data', (inputSegment) => {
    inputAccumulator += inputSegment.toString('utf8');
});

process.stdin.on('end', () => {
    const processedSegments = inputAccumulator.trim().split('\n');

    for (const currentSegment of processedSegments) {
        const parsedNumeric = Number(currentSegment);
        if (isNaN(parsedNumeric) || parsedNumeric === 0) {
            continue;
        }

        const fixedOffset = 600;
        const computedResult = evaluateGeometricProgression(parsedNumeric, fixedOffset);
        process.stdout.write(computedResult.toString() + '\n');
    }
});

function evaluateGeometricProgression(datumValue, referenceConstant) {
    const maxIterations = Math.floor((referenceConstant - 1) / datumValue);

    const sequenceIndices = Array.from({length: maxIterations}, (_, indexPosition) => indexPosition + 1);

    const finalAccumulation = sequenceIndices.reduce((currentAggregate, currentFactor) => {
        const componentTerm = referenceConstant - currentFactor * datumValue;
        return currentAggregate + (componentTerm * componentTerm * datumValue);
    }, 0);

    return finalAccumulation;
}