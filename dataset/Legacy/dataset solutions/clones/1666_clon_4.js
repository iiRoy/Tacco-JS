function processInputData(sourceText) {
    const parsedLines = sourceText.trim().split("\n");
    const firstSegmentValues = parsedLines[0].split(" ");
    const lowerBoundary = Number.parseInt(firstSegmentValues[0], 10);
    const upperBoundary = Number.parseInt(firstSegmentValues[1], 10);
    const commonDivisor = Number.parseInt(firstSegmentValues[2], 10);

    const multiplesUpToHigh = Math.floor(upperBoundary / commonDivisor);
    const multiplesBelowLow = Math.floor((lowerBoundary - 1) / commonDivisor);

    const totalOccurrences = multiplesUpToHigh - multiplesBelowLow;

    console.log(totalOccurrences);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
