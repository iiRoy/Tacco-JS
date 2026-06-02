function processInputData(rawData) {
    const lineSegments = rawData.split('\n');
    const relevantSegments = lineSegments.slice(1);

    const totalSpan = relevantSegments.reduce((accumulator, currentSegment) => {
        const numericBounds = currentSegment.split(' ');
        const lowerBound = Number(numericBounds[0]);
        const upperBound = Number(numericBounds[1]);
        const currentSpan = upperBound - lowerBound + 1;
        return accumulator + currentSpan;
    }, 0);

    console.log(totalSpan);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
