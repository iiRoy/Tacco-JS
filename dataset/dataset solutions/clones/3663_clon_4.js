function processInputData(rawData) {
    const initialSegments = rawData
        .split('\n')
        .slice(1)
        .filter(line => line.trim() !== '')
        .map(segmentSpec => segmentSpec.split(' ').map(Number))
        .map(([beginValue, endValue]) =>
            Array.from({ length: endValue - beginValue }, (_, index) => beginValue + index)
        );

    const finalSeparations = evaluateSegments(initialSegments, 1);

    console.log(finalSeparations);
}

function determineOverlap(collectionA, collectionB) {
    if (!collectionA || !collectionB) {
        return [];
    }
    const setReference = new Set(collectionA);
    return collectionB.filter(item => setReference.has(item));
}

function evaluateSegments(currentSegments, currentSeparations) {
    if (currentSegments.length <= 1) {
        return currentSeparations;
    }

    const firstComponent = currentSegments[0];
    const secondComponent = currentSegments[1];
    const subsequentComponents = currentSegments.slice(2);

    const sharedElements = determineOverlap(firstComponent, secondComponent);

    if (sharedElements.length > 0) {
        return evaluateSegments([sharedElements, ...subsequentComponents], currentSeparations);
    } else {
        return evaluateSegments([secondComponent, ...subsequentComponents], currentSeparations + 1);
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));