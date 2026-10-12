function ProcessInput(initialData) {
    let linesArray = initialData.split('\n');

    let firstLineString = linesArray.shift();

    let parsedCharacterSegments = firstLineString.split('').map(function(charSegment) {
        let numericParts = charSegment.split(' ').map(function(numStr) {
            return parseInt(numStr, 10);
        });
        return numericParts;
    });

    let totalSum = 0;

    for (const segmentPair of parsedCharacterSegments) {
        let secondElement = segmentPair[1];
        let firstElement = segmentPair[0];
        let intermediateResult = secondElement - firstElement + 1;
        totalSum += intermediateResult;
    }

    console.log('%d', totalSum);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
