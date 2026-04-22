const analyzeSequence = (dataPayload) => {
    const lineSegments = dataPayload.split('\n');
    const numericElements = lineSegments[1].split(' ').map(Number);

    const tallyZeroIndices = (elements) => {
        const accumulationState = { currentSumValue: 0, sumCounts: new Map([[0, 1]]) };
        return elements.reduce((state, currentElement) => {
            state.currentSumValue += currentElement;
            state.sumCounts.set(
                state.currentSumValue,
                (state.sumCounts.get(state.currentSumValue) || 0) + 1
            );
            return state;
        }, accumulationState).sumCounts;
    };

    const calculateCombinations = (countsMap) => {
        return Array.from(countsMap.values()).reduce((totalCombinations, quantity) => {
            return totalCombinations + (quantity * (quantity - 1)) / 2;
        }, 0);
    };

    const frequencies = tallyZeroIndices(numericElements);
    const result = calculateCombinations(frequencies);
    return result;
};

console.log(analyzeSequence(require("fs").readFileSync("/dev/stdin", "utf8")));