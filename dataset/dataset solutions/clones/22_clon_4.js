const systemSettings = { sourcePath: '/dev/stdin', lineSeparator: '\n' };

(function processInputAndCompute() {
    require('fs').readFileSync(systemSettings.sourcePath, 'ascii')
        .toString()
        .trim()
        .split(systemSettings.lineSeparator)
        .filter(Boolean)
        .map(rawLine => {
            const numericStrings = rawLine.match(/-?\d+/g);
            if (!numericStrings || numericStrings.length < 2) {
                return null;
            }
            return numericStrings.map(Number);
        })
        .filter(Boolean)
        .forEach(numPair => {
            const firstOperand = numPair[0];
            const secondOperand = numPair[1];

            const absFirst = Math.abs(firstOperand);
            const absSecond = Math.abs(secondOperand);

            const commonDivisor = findGreatestCommonDivisor(absFirst, absSecond);
            const commonMultiple = calculateLeastCommonMultiple(absFirst, absSecond, commonDivisor);

            console.log('%d %d', commonDivisor, commonMultiple);
        });
})();

function findGreatestCommonDivisor(valA, valB) {
    if (valB === 0) {
        return valA;
    }
    return findGreatestCommonDivisor(valB, valA % valB);
}

function calculateLeastCommonMultiple(valA, valB, divisor) {
    return (valA / divisor) * valB;
}
