const numFromStr = (val) => Number(val);

const extractNumericalData = (fullText) => {
    const lines = fullText.split('\n').filter(Boolean);
    const elementCount = numFromStr(lines[0]);
    const subsequentValues = lines.slice(1, elementCount + 1).map(numFromStr);
    return { size: elementCount, values: subsequentValues };
};

const calcAdjacentAbsDeltaSum = (numericSequence) =>
    numericSequence.slice(0, numericSequence.length - 1)
        .reduce((currentSum, currentElement, index) =>
            currentSum + Math.abs(currentElement - numericSequence[index + 1]), 0);

const permuteCollectionRandomly = (sourceCollection) => {
    const recursivePureShuffler = (remainingElements, resultSoFar = []) => {
        if (remainingElements.length === 0) {
            return resultSoFar;
        }
        const randomIndex = Math.floor(Math.random() * remainingElements.length);
        const elementToAppend = remainingElements[randomIndex];
        const nextRemaining = [
            ...remainingElements.slice(0, randomIndex),
            ...remainingElements.slice(randomIndex + 1)
        ];
        return recursivePureShuffler(nextRemaining, [...resultSoFar, elementToAppend]);
    };
    return recursivePureShuffler([...sourceCollection]);
};

const conductExperiment = (rawInputContent) => {
    const { values: initialNumericSet } = extractNumericalData(rawInputContent);

    const trialIterations = Array.from({ length: 10000 });

    const peakScore = trialIterations.reduce((currentHighestScore) => {
        const randomizedOrder = permuteCollectionRandomly(initialNumericSet);
        const currentTrialScore = calcAdjacentAbsDeltaSum(randomizedOrder);
        return Math.max(currentHighestScore, currentTrialScore);
    }, 0);

    console.log(peakScore);
};

conductExperiment(require("fs").readFileSync("/dev/stdin", "utf8"));