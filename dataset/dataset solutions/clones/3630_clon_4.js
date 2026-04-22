function analyzeSequence(rawData) {
    const numericParts = rawData.split(/\s|\n/).filter(Boolean).map(Number);

    let currentOffset = 0;
    const extractNextValue = () => numericParts[currentOffset++];
    const obtainNumericArray = (length) => {
        const collection = [];
        for (let idx = 0; idx < length; idx++) {
            collection.push(extractNextValue());
        }
        return collection;
    };

    const elementCount = extractNextValue();
    const modulusValue = extractNextValue();
    const sourceNumbers = obtainNumericArray(elementCount);

    const initialProcessingState = {
        totalSubsequencePairs: 0,
        remainderFrequencyMap: new Map(),
        currentAccumulatedSum: 0
    };

    initialProcessingState.remainderFrequencyMap.set(0, 1);

    const finalProcessingState = sourceNumbers.reduce((accumulator, currentNumber) => {
        accumulator.currentAccumulatedSum = (accumulator.currentAccumulatedSum + currentNumber) % modulusValue;

        const currentRemainder = accumulator.currentAccumulatedSum;
        const existingFrequency = accumulator.remainderFrequencyMap.get(currentRemainder) || 0;

        accumulator.totalSubsequencePairs += existingFrequency;
        accumulator.remainderFrequencyMap.set(currentRemainder, existingFrequency + 1);

        return accumulator;
    }, initialProcessingState);

    console.log(finalProcessingState.totalSubsequencePairs);
}

if (typeof module !== 'undefined' && module.exports) {
    analyzeSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
}