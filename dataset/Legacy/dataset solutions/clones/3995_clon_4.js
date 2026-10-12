function processInput(dataPayload) {
    const [firstLine] = dataPayload.split('\n');
    const [upperBoundStr, minRemainderStr] = firstLine.split(' ');

    const upperBound = parseInt(upperBoundStr, 10);
    const minRemainder = parseInt(minRemainderStr, 10);

    const effectiveLowerBound = minRemainder || 1;

    const generateSequence = (start, end) =>
        Array.from({ length: end - start + 1 }, (_, idx) => start + idx);

    const firstOperandRange = generateSequence(effectiveLowerBound, upperBound);
    const secondOperandRange = generateSequence(effectiveLowerBound, upperBound);

    const totalCount = firstOperandRange.reduce((currentTotal, currentA) => {
        const matchingBCount = secondOperandRange.filter(currentB => {
            const isLessThan = currentA < currentB;
            const isGreaterOrEqualWithRemainder = currentA >= currentB && (currentA % currentB) >= minRemainder;
            return isLessThan || isGreaterOrEqualWithRemainder;
        }).length;
        return currentTotal + matchingBCount;
    }, 0);

    console.log(totalCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
