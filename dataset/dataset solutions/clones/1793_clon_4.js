let acquiredData = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataChunk) => {
    acquiredData += dataChunk;
});

process.stdin.on('end', () => {
    const entryLines = acquiredData.split('\n').filter(Boolean);

    const configTokens = entryLines[0].split(' ');
    const matrixDimension = Number(configTokens[0]);
    const transformationRounds = Number(configTokens[1]);

    let currentMatrixState = entryLines[1].split(' ').map(Number);

    const getAbsoluteDifference = (val1, val2) => Math.abs(val1 - val2);

    const computeNextState = (previousState, dimensionSize) => {
        return Array.from({ length: dimensionSize }, (_, currentPosition) => {
            return previousState.filter((valueAtIndex, indexInPrevious) =>
                valueAtIndex >= getAbsoluteDifference(currentPosition, indexInPrevious)
            ).length;
        });
    };

    const applyTransformations = (initialState, roundsLeft, dimension) => {
        if (roundsLeft === 0) {
            return initialState;
        }
        const nextIterationState = computeNextState(initialState, dimension);
        return applyTransformations(nextIterationState, roundsLeft - 1, dimension);
    };

    const finalConfiguration = applyTransformations(currentMatrixState, transformationRounds, matrixDimension);

    const outputString = finalConfiguration.slice(0, 5).join(' ');

    process.stdout.write(outputString + '\n');
});

process.stdin.resume();