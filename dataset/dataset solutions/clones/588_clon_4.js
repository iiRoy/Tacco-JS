const obtainInputData = () => {
    const rawDataContent = process.stdin.readFileSync(0, 'utf8').trim().split('\n');
    const totalElementCount = Number(rawDataContent.shift());
    const startingElements = rawDataContent.slice(0, totalElementCount).map(Number);
    return { totalElementCount, startingElements };
};

const contractIdenticalDigits = (sequenceRepresentation) => {
    let currentSequenceState = sequenceRepresentation;
    let modificationFlag = true;

    while (modificationFlag) {
        modificationFlag = false;
        let nextSequenceState = '';
        let scanPosition = 0;

        while (scanPosition < currentSequenceState.length) {
            let currentCharacter = currentSequenceState[scanPosition];
            let consecutiveCharCount = 0;
            
            while (scanPosition < currentSequenceState.length && currentSequenceState[scanPosition] === currentCharacter) {
                consecutiveCharCount++;
                scanPosition++;
            }

            if ((currentCharacter === '1' || currentCharacter === '2' || currentCharacter === '3') && consecutiveCharCount >= 4) {
                modificationFlag = true;
            } else {
                nextSequenceState += currentCharacter.repeat(consecutiveCharCount);
            }
        }
        currentSequenceState = nextSequenceState;
    }
    return currentSequenceState;
};

let overallShortestLength = Number.POSITIVE_INFINITY;

const adjustShortestLength = (processedStringResult) => {
    overallShortestLength = Math.min(overallShortestLength, processedStringResult.length);
};

const createVariations = (baseElementSet, currentModificationIndex) => {
    const generatedVariations = [];

    if (currentModificationIndex < baseElementSet.length - 1) {
        const firstVariant = Array.from(baseElementSet);
        firstVariant[currentModificationIndex] = baseElementSet[currentModificationIndex + 1];
        generatedVariations.push(firstVariant);
    }

    if (currentModificationIndex > 0) {
        const secondVariant = Array.from(baseElementSet);
        secondVariant[currentModificationIndex] = baseElementSet[currentModificationIndex - 1];
        generatedVariations.push(secondVariant);
    }
    return generatedVariations;
};

const { totalElementCount, startingElements } = obtainInputData();

Array.from({ length: totalElementCount }).forEach((_, currentIterationIndex) => {
    const variationsForCurrentPosition = createVariations(startingElements, currentIterationIndex);

    variationsForCurrentPosition.forEach(elementCollection => {
        const concatenatedElements = elementCollection.join('');
        const finalReducedResult = contractIdenticalDigits(concatenatedElements);
        adjustShortestLength(finalReducedResult);
    });
});

console.log(overallShortestLength);