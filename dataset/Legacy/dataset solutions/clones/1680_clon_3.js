function parseInitialData(rawInputContent) {
    const lines = rawInputContent.split("\n");
    const numIterations = parseInt(lines[0], 10);
    const binaryString = lines[1];
    return { numIterations, binaryString };
}

function countSetBits(valueToAnalyze) {
    const binaryRepresentation = valueToAnalyze.toString(2);
    let setBitsCount = 0;
    for (let char of binaryRepresentation) {
        if (char === '1') {
            setBitsCount++;
        }
    }
    return setBitsCount;
}

function performRecursiveBitOperation(currentValue, currentIteration = 0) {
    if (currentValue === 0) {
        return currentIteration;
    }

    const divisorForModulo = countSetBits(currentValue);
    const nextValueForRecursion = currentValue % divisorForModulo;
    return performRecursiveBitOperation(nextValueForRecursion, currentIteration + 1);
}

function processInput(rawInput) {
    const { numIterations, binaryString } = parseInitialData(rawInput);

    for (let loopIndex = 0; loopIndex < numIterations; loopIndex++) {
        const charArray = binaryString.split('');
        const originalBit = charArray[loopIndex];
        const flippedBit = (originalBit === '1' ? '0' : '1');
        charArray[loopIndex] = flippedBit;
        const tempModifiedBinaryString = charArray.join('');

        const integerFromBinary = Number.parseInt(tempModifiedBinaryString, 2);

        console.log(performRecursiveBitOperation(integerFromBinary));
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
