function processData(inputString) {
    const targetNumber = Number(inputString);
    let lengthResults = [];

    const calculateMaxFactorLength = (val1, val2) => {
        const stringRepresentation1 = val1.toString();
        const stringRepresentation2 = val2.toString();
        const len1 = stringRepresentation1.length;
        const len2 = stringRepresentation2.length;
        return Math.max(len1, len2);
    };

    const loopUpperLimit = Math.sqrt(targetNumber);

    for (let currentDivisor = 1; currentDivisor <= loopUpperLimit; currentDivisor++) {
        const factorA = targetNumber / currentDivisor;
        const factorB = targetNumber / factorA; // This is equivalent to currentDivisor, but preserves original calculation structure.

        const currentMaxLen = calculateMaxFactorLength(factorA, factorB);
        lengthResults.push(currentMaxLen);
    }

    const sortedLengths = lengthResults.sort((valX, valY) => valX - valY);
    const minimumLength = sortedLengths[0];
    console.log(minimumLength);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
