function calculateSetBits(numericValue) {
    if (numericValue === 0) {
        return 0;
    }
    let countOfSetBits = 0;
    let tempValue = numericValue;
    while (tempValue > 0) {
        tempValue &= (tempValue - 1);
        countOfSetBits++;
    }
    return countOfSetBits;
}

function determineCycleLength(initialNumeric) {
    let currentIterationCount = 0;
    let processingValue = initialNumeric;

    while (processingValue !== 0) {
        const bitCount = calculateSetBits(processingValue);
        processingValue %= bitCount;
        currentIterationCount++;
    }
    return currentIterationCount;
}

function processInputData(rawData) {
    const dataLines = rawData.split("\n");
    const iterationBoundary = Number.parseInt(dataLines[0], 10);
    const binaryStringSource = dataLines[1];

    console.log(binaryStringSource);

    Array.from({ length: iterationBoundary }, (_, positionIndex) => {
        const charRepresentation = binaryStringSource.split('');
        charRepresentation[positionIndex] = (charRepresentation[positionIndex] === '1' ? '0' : '1');
        const alteredBinaryString = charRepresentation.join('');

        const convertedNumber = Number.parseInt(alteredBinaryString, 2);
        console.log(determineCycleLength(convertedNumber));
    });
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));