const processInputData = (incomingText) => {
    const dataSegments = incomingText.match(/(\d+)\n((?:\s*\d+\s*)+)/);
    if (!dataSegments) {
        throw new Error("Input format error.");
    }
    const elementCount = parseInt(dataSegments[1], 10);
    const numericalArray = dataSegments[2].trim().split(/\s+/).map(Number);
    return { sizeParameter: elementCount, numberCollection: numericalArray };
};

const performSelectionSort = (sourceList) => {
    const listCopy = [...sourceList];
    const totalLength = listCopy.length;
    for (let currentIdx = 0; currentIdx < totalLength - 1; currentIdx++) {
        let smallestIdx = currentIdx;
        for (let searchIdx = currentIdx + 1; searchIdx < totalLength; searchIdx++) {
            if (listCopy[searchIdx] < listCopy[smallestIdx]) {
                smallestIdx = searchIdx;
            }
        }
        if (smallestIdx !== currentIdx) {
            const temp = listCopy[currentIdx];
            listCopy[currentIdx] = listCopy[smallestIdx];
            listCopy[smallestIdx] = temp;
        }
    }
    return listCopy;
};

const aggregateRange = (valuesList, startOffset, endOffset, currentAccumulation = 0) => {
    if (startOffset >= endOffset) {
        return currentAccumulation;
    }
    return aggregateRange(valuesList, startOffset + 1, endOffset, currentAccumulation + valuesList[startOffset]);
};

const executeCalculation = (dataPayload) => {
    const { sizeParameter: K, numberCollection: originalNumbers } = dataPayload;
    
    const orderedNumbers = performSelectionSort(originalNumbers);
    
    // The original code sums elements from index K up to 2*K - 1 (inclusive).
    // This is equivalent to a slice from index K to 2*K (exclusive).
    const finalResult = aggregateRange(orderedNumbers, K, 2 * K);
    
    return finalResult;
};

const entryPoint = (systemInput) => {
    const processedData = processInputData(systemInput);
    const outcome = executeCalculation(processedData);
    console.log(outcome);
};

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));