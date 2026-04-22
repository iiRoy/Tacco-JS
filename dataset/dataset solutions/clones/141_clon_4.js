let collectedTextualContent = '';

process.stdin.on('data', (dataChunkSegment) => {
    collectedTextualContent += dataChunkSegment.toString();
});

process.stdin.on('end', () => {
    initiateGeometricAnalysis(collectedTextualContent);
});

function calculateVectorGradient(firstCoordinatePair, secondCoordinatePair) {
    const verticalDisplacement = firstCoordinatePair[1] - secondCoordinatePair[1];
    const horizontalDisplacement = firstCoordinatePair[0] - secondCoordinatePair[0];

    if (horizontalDisplacement === 0) {
        return verticalDisplacement > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    }
    return verticalDisplacement / horizontalDisplacement;
}

function evaluatePolygonOrientation(inputLineOfNumbers) {
    const numericCoordinates = inputLineOfNumbers.split(',').map(Number);
    
    const pointOne = [numericCoordinates[0], numericCoordinates[1]];
    const pointTwo = [numericCoordinates[2], numericCoordinates[3]];
    const pointThree = [numericCoordinates[4], numericCoordinates[5]];
    const pointFour = [numericCoordinates[6], numericCoordinates[7]];

    const segmentGradientsSequence = [
        calculateVectorGradient(pointOne, pointTwo),
        calculateVectorGradient(pointTwo, pointThree),
        calculateVectorGradient(pointThree, pointFour),
        calculateVectorGradient(pointFour, pointOne)
    ];

    const countOfAscendingSegments = segmentGradientsSequence.filter(val => val >= 0).length;

    return countOfAscendingSegments % 2 === 1 ? 'YES' : 'NO';
}

function initiateGeometricAnalysis(fullInputDataStream) {
    const parsedDataEntries = fullInputDataStream
        .trim()
        .split('\n')
        .filter(entry => entry.length > 0);

    const computedOutcomes = parsedDataEntries.map(evaluatePolygonOrientation);

    if (computedOutcomes.length > 0) {
        process.stdout.write(computedOutcomes.join('\n') + '\n');
    }
}