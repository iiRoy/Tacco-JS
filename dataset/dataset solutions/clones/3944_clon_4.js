function processExternalData(rawContent) {
    const determineCeilingValue = (dividend, divisor) => {
        if (divisor === 0) {
            throw new Error("Divisor cannot be zero for ceiling calculation.");
        }
        // This calculates Math.ceil(dividend / divisor) for positive integers
        // using an integer arithmetic trick and bitwise OR for truncation.
        return (dividend + divisor - 1) / divisor | 0;
    };

    const contentSegments = rawContent.split('\n');

    const totalEntries = +contentSegments[0];

    const [baseDuration, initialAggregate] = contentSegments[1].split(' ').map(val => +val);

    const entryDivisors = contentSegments.slice(2, 2 + totalEntries).map(val => +val);

    const finalAggregate = entryDivisors.reduce((currentSum, currentDivisor) => {
        return currentSum + determineCeilingValue(baseDuration, currentDivisor);
    }, initialAggregate);

    console.log(finalAggregate);
}

processExternalData(require("fs").readFileSync("/dev/stdin", "utf8"));