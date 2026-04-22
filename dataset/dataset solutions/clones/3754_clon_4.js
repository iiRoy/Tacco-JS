function processData(rawPayload) {
    const contentLines = rawPayload.split('\n');
    const numericalStringLine = contentLines[1];
    const integerCollection = numericalStringLine.split(' ').filter(Boolean).map(val => parseInt(val, 10));

    const determineFactorsOfTwo = (valueEntry) => {
        if (valueEntry === 0) {
            return 0;
        }
        // Using bitwise operations to count trailing zeros (factors of 2).
        // (valueEntry & -valueEntry) isolates the least significant set bit.
        // Math.log2 of this result gives its position, which is the count.
        return Math.log2(valueEntry & -valueEntry);
    };

    const cumulativeTwoDivisions = integerCollection.reduce((total, currentNumber) => {
        return total + determineFactorsOfTwo(currentNumber);
    }, 0);

    console.log(cumulativeTwoDivisions);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));