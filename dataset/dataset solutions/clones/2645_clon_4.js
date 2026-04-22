const analyzeStructuralElements = (sourceSequence) => {
    const decomposeRecursively = (currentPointer, collectedParts) => {
        if (currentPointer < 0) {
            return collectedParts;
        }

        const symbolAtCurrent = sourceSequence.charAt(currentPointer);

        if (collectedParts.length === 0) {
            return decomposeRecursively(currentPointer - 1, collectedParts.concat(symbolAtCurrent));
        } else {
            const finalPartAdded = collectedParts[collectedParts.length - 1];

            if (finalPartAdded.length === 1 && finalPartAdded.charAt(0) === symbolAtCurrent) {
                const priorSymbol = (currentPointer > 0) ? sourceSequence.charAt(currentPointer - 1) : '';
                return decomposeRecursively(currentPointer - 2, collectedParts.concat(priorSymbol + symbolAtCurrent));
            } else {
                return decomposeRecursively(currentPointer - 1, collectedParts.concat(symbolAtCurrent));
            }
        }
    };

    const assembledParts = decomposeRecursively(sourceSequence.length - 1, []);
    let computedQuantity = assembledParts.length;

    if (sourceSequence.length >= 2 && sourceSequence.charAt(0) === sourceSequence.charAt(1)) {
        computedQuantity--;
    }

    return computedQuantity;
};

const processInputData = (incomingStream) => {
    const processedValue = analyzeStructuralElements(incomingStream);
    console.log(processedValue.toString());
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));