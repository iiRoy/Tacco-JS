function prepareNumericSequence(inputString, separator) {
    const stringNumbers = inputString.split(separator);
    const parsedNumbers = stringNumbers.map(s => parseInt(s, 10));
    parsedNumbers.sort((a, b) => a - b);
    return parsedNumbers;
}

function calculateTotalAbsoluteDifference(numericSequence) {
    let accumulatedDifference = 0;
    const sequenceLength = numericSequence.length;

    if (sequenceLength < 2) {
        return 0;
    }

    const iterationLimit = sequenceLength - 1;

    for (let currentIdx = 0; currentIdx < iterationLimit; ++currentIdx) {
        const currentValue = numericSequence[currentIdx];
        const nextValue = numericSequence[currentIdx + 1];
        const absoluteStepDifference = Math.abs(currentValue - nextValue);
        accumulatedDifference += absoluteStepDifference;
    }
    return accumulatedDifference;
}

function processInputData(rawData) {
    const inputDelimiter = ' ';
    const sortedNumbers = prepareNumericSequence(rawData, inputDelimiter);
    const finalResult = calculateTotalAbsoluteDifference(sortedNumbers);
    console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
