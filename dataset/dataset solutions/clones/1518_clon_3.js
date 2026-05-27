const parseInputParameters = (inputLine) => {
    return inputLine.split(" ").map(Number);
};

const computeNextSequenceValue = (previousValue, currentModulus) => {
    return (previousValue * previousValue) % currentModulus;
};

const sumArrayRange = (dataArray, startIndex, endIndex) => {
    let rangeTotal = 0;
    for (let k = startIndex; k < endIndex; k++) {
        rangeTotal += dataArray[k];
    }
    return rangeTotal;
};

const main = (inputArgument) => {
    const [totalElementsN, startingValueX, modulusM] = parseInputParameters(inputArgument);

    const sequenceValues = new Array(modulusM).fill(0);
    const firstOccurrence = new Array(modulusM).fill(-1);

    sequenceValues[0] = startingValueX;
    firstOccurrence[startingValueX] = 0;

    let currentSequenceIndex = 1;
    let cycleDetectionStart = 0;
    let cycleDetectionEnd = 0;

    while (currentSequenceIndex < modulusM) {
        const previousSequenceValue = sequenceValues[currentSequenceIndex - 1];
        const nextCalculatedValue = computeNextSequenceValue(previousSequenceValue, modulusM);
        sequenceValues[currentSequenceIndex] = nextCalculatedValue;

        if (firstOccurrence[nextCalculatedValue] !== -1) {
            cycleDetectionStart = firstOccurrence[nextCalculatedValue];
            cycleDetectionEnd = currentSequenceIndex;
            break;
        } else {
            firstOccurrence[nextCalculatedValue] = currentSequenceIndex;
        }
        currentSequenceIndex++;
    }

    if (cycleDetectionEnd === 0 && currentSequenceIndex === modulusM) {
        cycleDetectionEnd = currentSequenceIndex;
    }

    const effectiveCycleLength = cycleDetectionEnd - cycleDetectionStart;
    const fullCycleRepetitions = (effectiveCycleLength === 0) ? 0 : Math.floor(totalElementsN / effectiveCycleLength);

    let finalAccumulatedSum = 0;
    let sumOfOneCycle = 0;

    sumOfOneCycle = sumArrayRange(sequenceValues, cycleDetectionStart, cycleDetectionEnd);
    finalAccumulatedSum += sumOfOneCycle * fullCycleRepetitions;

    finalAccumulatedSum += sumArrayRange(sequenceValues, 0, cycleDetectionStart);

    const remainingElementsToProcess = (effectiveCycleLength === 0) ? 0 : totalElementsN - cycleDetectionStart - (effectiveCycleLength * fullCycleRepetitions);
    finalAccumulatedSum += sumArrayRange(sequenceValues, cycleDetectionStart, cycleDetectionStart + remainingElementsToProcess);

    console.log(finalAccumulatedSum);
};

main("1000 2 16");
