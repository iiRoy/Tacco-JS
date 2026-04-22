const processInputString = (rawPayload) => {
    const lines = rawPayload.split('\n');
    const firstLineParts = lines[0].split(/\s+/);
    const sequenceSize = parseInt(firstLineParts[0], 10);
    const dataItems = lines[1].split(/\s+/).map(val => +val);

    const recursiveSegmentAnalysis = (remainingElements, currentAdditiveSum, currentBitwiseSum, foundMatches) => {
        if (remainingElements.length === 0) {
            return foundMatches;
        }

        const [headElement, ...tailElements] = remainingElements;

        const updatedAdditiveSum = currentAdditiveSum + headElement;
        const updatedBitwiseSum = currentBitwiseSum ^ headElement;

        if (updatedAdditiveSum === updatedBitwiseSum) {
            foundMatches.push(1);
        }

        return recursiveSegmentAnalysis(tailElements, updatedAdditiveSum, updatedBitwiseSum, foundMatches);
    };

    const comparisonTally = dataItems.flatMap((_element, startPointer, allItems) => {
        if (startPointer === allItems.length - 1) {
            return []; // Cannot form a sub-sequence of length > 1 starting from the last element
        }

        const initialElementValue = allItems[startPointer];
        const remainingPart = allItems.slice(startPointer + 1);

        return recursiveSegmentAnalysis(remainingPart, initialElementValue, initialElementValue, []);
    }).reduce((accumulator, value) => accumulator + value, 0);

    console.log(comparisonTally + sequenceSize);
};