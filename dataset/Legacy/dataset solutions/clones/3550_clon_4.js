const determineValidChain = (inputSequence) => {
    if (!inputSequence || inputSequence.length === 0 || inputSequence[0] === '') {
        return [];
    }

    const firstInvalidIndex = inputSequence.findIndex((currentWord, idx, fullSequence) => {
        if (idx === 0) {
            return false;
        }

        const priorWord = fullSequence[idx - 1];

        if (currentWord === '') {
            return true;
        }

        if (currentWord[0] !== priorWord[priorWord.length - 1]) {
            return true;
        }

        return false;
    });

    if (firstInvalidIndex === -1) {
        return inputSequence;
    } else {
        return inputSequence.slice(0, firstInvalidIndex);
    }
};
