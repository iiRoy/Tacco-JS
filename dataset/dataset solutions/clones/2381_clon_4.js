function Main(input) {
    const inputLines = input.trim().split('\n');

    const firstLineParts = inputLines[0].split(' ');
    const secondLineParts = inputLines[1].split(' ');
    const thirdLineParts = inputLines[2].split(' ');

    const timePeriodOne = parseInt(firstLineParts[0], 10);
    const timePeriodTwo = parseInt(firstLineParts[1], 10);

    const entityARateOne = parseInt(secondLineParts[0], 10);
    const entityARateTwo = parseInt(secondLineParts[1], 10);

    const entityBRateOne = parseInt(thirdLineParts[0], 10);
    const entityBRateTwo = parseInt(thirdLineParts[1], 10);

    const getBigIntFloor = (numerator, denominator) => numerator / denominator;

    const getBigIntCeil = (numerator, denominator) => {
        const divisionResult = numerator / denominator;
        if (numerator % denominator === 0n) {
            return divisionResult;
        }
        if ((numerator > 0n && denominator > 0n) || (numerator < 0n && denominator < 0n)) {
            return divisionResult + 1n;
        }
        return divisionResult;
    };

    const initialRelativeOffset = BigInt(entityARateOne - entityBRateOne) * BigInt(timePeriodOne);
    const cycleEndRelativeOffset = BigInt(entityARateTwo - entityBRateTwo) * BigInt(timePeriodTwo) + initialRelativeOffset;

    let totalCrossings;

    const determineCrossingResult = (startOffset, endOffset) => {
        if (endOffset === 0n) {
            return 'infinity';
        } else if (startOffset * endOffset < 0n) {
            const effectiveDivisor = -endOffset;
            return getBigIntFloor(startOffset, effectiveDivisor) + getBigIntCeil(startOffset, effectiveDivisor);
        } else {
            return 0n;
        }
    };

    totalCrossings = determineCrossingResult(initialRelativeOffset, cycleEndRelativeOffset);

    console.log(totalCrossings.toString());
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
