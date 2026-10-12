function processInputData(rawInputString) {
    const RADIX_DECIMAL = 10;

    let inputLines = rawInputString.split('\n');

    if (inputLines.length > 0) {
        inputLines.splice(0, 1);
    }

    const parseLineToRange = (lineContent) => {
        const stringParts = lineContent.split(' ');
        const startValue = parseInt(stringParts[0], RADIX_DECIMAL);
        const endValue = parseInt(stringParts[1], RADIX_DECIMAL);
        return [startValue, endValue];
    };

    const parsedRangeData = inputLines.map(parseLineToRange);

    let totalRangeSum = 0;

    for (const currentRangePair of parsedRangeData) {
        const rangeStart = currentRangePair[0];
        const rangeEnd = currentRangePair[1];

        const currentRangeLength = rangeEnd - rangeStart + 1;

        totalRangeSum += currentRangeLength;
    }

    console.log('%d', totalRangeSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
