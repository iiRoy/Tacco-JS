const ascertainMonotony = (textualArrangement) => {
    if (textualArrangement.length <= 1) return true;
    return textualArrangement.split('').every(characterUnit => characterUnit === textualArrangement[0]);
};

const executeIterativeReduction = (currentText, desiredCharacter) => {
    if (currentText.length < 2) {
        return currentText;
    }
    return Array.from({ length: currentText.length - 1 }, (_, indexPosition) => {
        const firstCharacter = currentText[indexPosition];
        const secondCharacter = currentText[indexPosition + 1];
        return (firstCharacter === desiredCharacter || secondCharacter === desiredCharacter) ? desiredCharacter : firstCharacter;
    }).join('');
};

const computeTransformationSequenceLength = (initialText, focalCharacter, currentIterationCount = 0) => {
    if (ascertainMonotony(initialText)) {
        return currentIterationCount;
    }
    const derivedText = executeIterativeReduction(initialText, focalCharacter);
    return computeTransformationSequenceLength(derivedText, focalCharacter, currentIterationCount + 1);
};

const processIncomingText = (sourceData) => {
    const originalSequence = sourceData.split('\n')[0];

    if (ascertainMonotony(originalSequence)) {
        return 0;
    }

    let minimalOperationCount = originalSequence.length;

    const characterUniverse = Array.from({ length: 26 }, (_, alphabetIndex) => String.fromCharCode('a'.charCodeAt(0) + alphabetIndex));

    for (const candidateCharacter of characterUniverse) {
        const operationsForCurrentCandidate = computeTransformationSequenceLength(originalSequence, candidateCharacter);
        if (operationsForCurrentCandidate < minimalOperationCount) {
            minimalOperationCount = operationsForCurrentCandidate;
        }
    }

    return minimalOperationCount;
};

const commenceProcessing = (payloadContent) => {
    const ultimateOutcome = processIncomingText(payloadContent);
    console.log(ultimateOutcome);
};

commenceProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));