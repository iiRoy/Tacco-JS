const computeSolution = (rawData) => {
    const processedLines = rawData.trim().split('\n');
    const configurationValues = processedLines[0].split(' ').map(Number);
    const pointCount = configurationValues[0];
    const dimensionCount = configurationValues[1];

    const vectorCollection = processedLines.slice(1, pointCount + 1)
        .map(lineText => lineText.split(' ').map(Number));

    const allSeparations = vectorCollection.flatMap((primaryVector, outerIndex) =>
        vectorCollection.slice(outerIndex + 1).map(secondaryVector =>
            calculateSpatialExtent(primaryVector, secondaryVector)
        )
    );

    const integerDistanceCount = allSeparations.filter(val => Number.isInteger(val)).length;

    console.log(integerDistanceCount);
};

const calculateSpatialExtent = (firstVector, secondVector) => {
    let sumOfSquaredDifferences = 0;
    for (let coordinateIndex = 0; coordinateIndex < firstVector.length; ++coordinateIndex) {
        const difference = firstVector[coordinateIndex] - secondVector[coordinateIndex];
        sumOfSquaredDifferences += difference * difference;
    }
    return Math.sqrt(sumOfSquaredDifferences);
};

computeSolution(require('fs').readFileSync('/dev/stdin', 'utf8'));