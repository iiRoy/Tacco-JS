function obtainNextOccurrence(sortedIndices, referenceValue) {
    let lowerBound = 0;
    let upperBound = sortedIndices.length - 1;
    let resultingIndex = -1;

    while (lowerBound <= upperBound) {
        const midPoint = Math.floor((lowerBound + upperBound) / 2);
        if (sortedIndices[midPoint] > referenceValue) {
            resultingIndex = sortedIndices[midPoint];
            upperBound = midPoint - 1;
        } else {
            lowerBound = midPoint + 1;
        }
    }
    return resultingIndex;
}

((dataStream) => {
    const [initialSequence, soughtSequence] = dataStream.trim().split('\n');
    const initialSequenceLength = initialSequence.length;
    const soughtSequenceLength = soughtSequence.length;

    const characterPositionRegistry = new Map();
    for (let currentPosition = 0; currentPosition < initialSequenceLength; currentPosition++) {
        const characterElement = initialSequence[currentPosition];
        if (!characterPositionRegistry.has(characterElement)) {
            characterPositionRegistry.set(characterElement, []);
        }
        characterPositionRegistry.get(characterElement).push(currentPosition);
    }

    let currentMatchProgress = {
        lastMatchedPosition: -1,
        fullSequenceIterations: 0,
        isFeasible: true
    };

    for (let sequencePointer = 0; sequencePointer < soughtSequenceLength; sequencePointer++) {
        if (!currentMatchProgress.isFeasible) {
            break;
        }

        const requiredCharacter = soughtSequence[sequencePointer];
        const availablePositions = characterPositionRegistry.get(requiredCharacter);

        if (!availablePositions || availablePositions.length === 0) {
            currentMatchProgress.isFeasible = false;
            break;
        }

        let nextPotentialMatch = obtainNextOccurrence(availablePositions, currentMatchProgress.lastMatchedPosition);

        if (nextPotentialMatch !== -1) {
            currentMatchProgress.lastMatchedPosition = nextPotentialMatch;
        } else {
            currentMatchProgress.fullSequenceIterations++;
            currentMatchProgress.lastMatchedPosition = availablePositions[0];
        }
    }

    if (!currentMatchProgress.isFeasible) {
        process.stdout.write('-1');
    } else {
        process.stdout.write(`${currentMatchProgress.fullSequenceIterations * initialSequenceLength + currentMatchProgress.lastMatchedPosition + 1}`);
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));