function solveChallenge(rawData) {
    const contentLines = rawData.split('\n');

    const generalParameters = contentLines[0].split(' ').map(Number);
    const numberOfRanges = generalParameters[1];

    const parsedRanges = contentLines.slice(1, 1 + numberOfRanges).map(singleLine => {
        const numericBounds = singleLine.split(' ').map(Number);
        return { lowerBound: numericBounds[0], upperBound: numericBounds[1] };
    });

    const allLowerBounds = parsedRanges.map(rangeObject => rangeObject.lowerBound);
    const allUpperBounds = parsedRanges.map(rangeObject => rangeObject.upperBound);

    const maximumLower = Math.max(...allLowerBounds);
    const minimumUpper = Math.min(...allUpperBounds);

    const intersectionLength = Math.max(0, minimumUpper - maximumLower + 1);

    console.log(intersectionLength);
}

// solveChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));
solveChallenge(require("fs").readFileSync("./inputdata.txt", "utf8"));