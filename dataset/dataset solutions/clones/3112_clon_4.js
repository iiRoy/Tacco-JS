const contentExtractor = (rawTextContent) => {
    const textSections = rawTextContent.trim().split('\n');
    const firstNumericValue = parseFloat(textSections[0].split(' ').pop());
    const secondNumericArray = textSections[1].split(' ').map(Number);
    return {
        acquireScalar: () => firstNumericValue,
        acquireList: () => secondNumericArray,
    };
};

const executeSequenceOperation = (inputSeries) => {
    const seriesLength = inputSeries.length;

    const finalProcessingState = Array.from({ length: seriesLength }).reduce((currentStatus) => {
        if (!currentStatus.isFeasible || currentStatus.activeSet.length === 0) {
            return currentStatus;
        }

        const currentSetSize = currentStatus.activeSet.length;
        const reversedActiveSet = [...currentStatus.activeSet].reverse();

        const matchingReverseIndex = reversedActiveSet.findIndex((elementValue, reversePosition) => {
            return elementValue === (currentSetSize - 1 - reversePosition) + 1;
        });

        if (matchingReverseIndex === -1) {
            return { ...currentStatus, isFeasible: false };
        }

        const actualMatchingIndex = currentSetSize - 1 - matchingReverseIndex;
        const removedItem = currentStatus.activeSet[actualMatchingIndex];

        const updatedSet = [
            ...currentStatus.activeSet.slice(0, actualMatchingIndex),
            ...currentStatus.activeSet.slice(actualMatchingIndex + 1)
        ];

        return {
            activeSet: updatedSet,
            extractedItems: [...currentStatus.extractedItems, removedItem],
            isFeasible: true,
        };
    }, { activeSet: [...inputSeries], extractedItems: [], isFeasible: true });

    if (!finalProcessingState.isFeasible) {
        return "-1";
    } else {
        return finalProcessingState.extractedItems.reverse().join("\n");
    }
};

const initiateProcessing = () => {
    const dataStreamHandler = contentExtractor(require("fs").readFileSync("/dev/stdin", "utf8"));
    const discardableValue = dataStreamHandler.acquireScalar();
    const targetSequence = dataStreamHandler.acquireList();

    return executeSequenceOperation(targetSequence);
};

console.log(initiateProcessing());