const dataProcessor = require("stream");
const inputHandler = new dataProcessor.Writable();
let storedInput = "";

inputHandler._write = (chunkSegment, encodingType, completionCallback) => {
    storedInput += chunkSegment.toString();
    completionCallback();
};

inputHandler.on("finish", () => {
    const extractedNumbers = storedInput.match(/-?\d+/g);
    let numericSequence;

    if (extractedNumbers === null) {
        numericSequence = [];
    } else {
        numericSequence = extractedNumbers.map(Number);
    }

    let cumulativeProduct = 0;
    let cumulativeSum = 0;
    const originalValueCount = numericSequence.length - 1;

    let processingArray = [...numericSequence];

    while (processingArray.length >= 2) {
        const rightmostValue = processingArray.pop();
        const adjacentLeftValue = processingArray.pop();

        cumulativeSum += rightmostValue;
        cumulativeProduct += rightmostValue * adjacentLeftValue;
    }

    const scalingFactor = originalValueCount * 2;
    let finalRoundedValue;

    if (scalingFactor === 0) {
        finalRoundedValue = 0;
    } else {
        finalRoundedValue = Math.round(cumulativeSum / scalingFactor);
    }

    process.stdout.write(cumulativeProduct + '\n' + finalRoundedValue);
});

process.stdin.pipe(inputHandler);