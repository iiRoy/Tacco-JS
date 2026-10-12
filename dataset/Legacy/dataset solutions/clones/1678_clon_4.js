function bitCount(value) {
    let setBits = 0;
    let currentNumber = value;
    while (currentNumber > 0) {
        currentNumber &= (currentNumber - 1); // Brian Kernighan's algorithm
        setBits++;
    }
    return setBits;
}

function computeChainLength(initialValue) {
    let workingValue = initialValue;
    let chainLength = 0;
    while (workingValue !== 0) {
        const onesCount = bitCount(workingValue);
        // If workingValue is 0, onesCount will be 0, and the loop condition handles termination.
        // For workingValue > 0, onesCount will always be >= 1.
        workingValue %= onesCount;
        chainLength++;
    }
    return chainLength;
}

function processInput(rawInputData) {
    const dataLines = rawInputData.split("\n");
    const iterationLimit = Number(dataLines[0]);
    const originalBinarySequence = dataLines[1];

    console.log(originalBinarySequence);

    const computedResults = Array.from({ length: iterationLimit }, (_, currentIndex) => {
        const charArrayRepresentation = Array.from(originalBinarySequence);
        // Toggle the character at the current index
        charArrayRepresentation[currentIndex] = (charArrayRepresentation[currentIndex] === '1' ? '0' : '1');
        const modifiedBinarySequence = charArrayRepresentation.join('');

        const decimalEquivalent = parseInt(modifiedBinarySequence, 2);
        return computeChainLength(decimalEquivalent);
    });

    computedResults.forEach(result => console.log(result));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
