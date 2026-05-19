process.stdin.resume();
process.stdin.setEncoding("utf8");

const getSumFromNumberMatch = (matchArray) => {
    if (!matchArray || matchArray.length !== 3) {
        return undefined;
    }

    const DECIMAL_RADIX = 10;

    const firstNumericValue = parseInt(matchArray[1], DECIMAL_RADIX);
    const secondNumericValue = parseInt(matchArray[2], DECIMAL_RADIX);

    const computedSum = firstNumericValue + secondNumericValue;

    return computedSum;
};

process.stdin.on("data", function(inputBuffer) {
    const receivedInputChunk = String(inputBuffer);
    const allInputLines = receivedInputChunk.split("\n");

    const numberPairRegexPattern = /([\d]+) ([\d]+)/;

    for(let lineIndex = 0; lineIndex < allInputLines.length; lineIndex++) {
        const currentProcessingLine = allInputLines[lineIndex];
        const lineMatchResult = numberPairRegexPattern.exec(currentProcessingLine);

        const potentialSum = getSumFromNumberMatch(lineMatchResult);

        if (potentialSum !== undefined) {
            const sumOutputString = potentialSum.toString();
            process.stdout.write(sumOutputString);
            process.stdout.write("\n");
        }
    }
});
