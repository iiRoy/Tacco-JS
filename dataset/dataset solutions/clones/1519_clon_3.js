const processInput = (inputString) => {
    const inputParts = inputString.split(" ");
    const limitN = Number(inputParts[0]);
    const initialX = Number(inputParts[1]);
    const modulusM = Number(inputParts[2]);

    const sequenceCapacity = modulusM;
    let sequenceValues = Array.from({ length: sequenceCapacity }, () => 0);
    let valueToFirstIndex = Array.from({ length: sequenceCapacity }, () => 0);

    const initialSequenceIndex = 0;
    sequenceValues[initialSequenceIndex] = initialX;
    valueToFirstIndex[initialSequenceIndex] = initialX;

    let currentIndex = 1;
    let cycleStartIndex = 0;
    let previousSequenceValue = initialX;

    while (currentIndex < modulusM) {
        const currentSequenceValue = (previousSequenceValue * previousSequenceValue) % modulusM;
        sequenceValues[currentIndex] = currentSequenceValue;

        if (valueToFirstIndex[currentSequenceValue] !== 0) {
            cycleStartIndex = valueToFirstIndex[currentSequenceValue];
            break;
        } else {
            valueToFirstIndex[currentSequenceValue] = currentIndex;
        }
        previousSequenceValue = currentSequenceValue;
        currentIndex++;
    }

    const cycleEndIndex = currentIndex;
    const cycleLength = cycleEndIndex - cycleStartIndex;

    let fullCycleIterations = 0;
    if (cycleLength !== 0) {
        const elementsBeforeCycle = cycleStartIndex;
        const remainingElementsForCycles = limitN - elementsBeforeCycle;
        if (remainingElementsForCycles > 0) {
            fullCycleIterations = Math.floor(remainingElementsForCycles / cycleLength);
        }
    }

    const calculateRangeSum = (arr, startIdx, endIdx) => {
        let currentRangeSum = 0;
        for (let k = startIdx; k < endIdx; k++) {
            currentRangeSum += arr[k];
        }
        return currentRangeSum;
    };

    let totalSum = 0;

    const sumBeforeCycle = calculateRangeSum(sequenceValues, 0, cycleStartIndex);
    totalSum += sumBeforeCycle;

    const sumOfOneCycle = calculateRangeSum(sequenceValues, cycleStartIndex, cycleEndIndex);
    totalSum += sumOfOneCycle * fullCycleIterations;

    const remainingElementsCount = (cycleLength === 0) ? 0 : limitN - cycleStartIndex - (cycleLength * fullCycleIterations);
    const sumOfRemainingElements = calculateRangeSum(sequenceValues, cycleStartIndex, cycleStartIndex + remainingElementsCount);
    totalSum += sumOfRemainingElements;

    console.log(totalSum);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
