function processInputData(rawInputLines) {
    const lines = rawInputLines.split("\n");
    const loopCount = parseInt(lines[0], 10);
    const initialBinaryString = lines[1];

    console.log(initialBinaryString);

    for (let currentIndex = 0; currentIndex < loopCount; currentIndex++) {
        const charToFlip = initialBinaryString[currentIndex];
        const flippedChar = (charToFlip === "1" ? "0" : "1");

        const prefixSegment = initialBinaryString.slice(0, currentIndex);
        const suffixSegment = initialBinaryString.slice(currentIndex + 1);
        const transformedBinaryString = prefixSegment + flippedChar + suffixSegment;

        const decimalValue = Number.parseInt(transformedBinaryString, 2);
        console.log(recursiveFunction(decimalValue, 0));
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

function calculateSetBitCount(valueToProcess) {
    const binaryRepresentation = valueToProcess.toString(2);
    const setBitsArray = binaryRepresentation.match(/1/g);
    return setBitsArray ? setBitsArray.length : 0;
}

function recursiveFunction(valueToProcess, depthCounter) {
    if (valueToProcess === 0) {
        return depthCounter;
    }

    const setBits = calculateSetBitCount(valueToProcess);
    // If valueToProcess > 0, setBits will always be >= 1.
    // The original `if (p === 0)` check for p > 0 is unreachable.

    const nextValue = valueToProcess % setBits;
    return recursiveFunction(nextValue, depthCounter + 1);
}
