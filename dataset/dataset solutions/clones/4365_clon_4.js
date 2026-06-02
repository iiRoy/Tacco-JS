function processRangeData(rawData) {
    const parsedRanges = rawData
        .split('\n')
        .slice(1)
        .map(lineSegment =>
            lineSegment.split(' ').map(val => parseInt(val, 10))
        );

    const totalSpan = parsedRanges.reduce((accumulator, currentPair) => {
        const [lowerBound, upperBound] = currentPair;
        return accumulator + (upperBound - lowerBound + 1);
    }, 0);

    console.log('%d', totalSpan);
}

processRangeData(require("fs").readFileSync("/dev/stdin", "utf8"));
