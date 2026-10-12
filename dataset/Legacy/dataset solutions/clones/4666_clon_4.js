function processInput(rawData) {
    const numericTarget = parseFloat(rawData);

    const factorCandidates = Array.from(
        { length: Math.floor(Math.sqrt(numericTarget)) },
        (_, index) => index + 1
    );

    const maximumLengths = factorCandidates.map(currentFactor => {
        const otherFactor = numericTarget / currentFactor;
        const lengthA = String(currentFactor).length;
        const lengthB = String(otherFactor).length;
        return Math.max(lengthA, lengthB);
    });

    const minimumOverallLength = maximumLengths.reduce(
        (accumulator, currentMax) => Math.min(accumulator, currentMax),
        Infinity
    );

    console.log(minimumOverallLength);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
