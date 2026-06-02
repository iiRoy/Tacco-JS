function calculateInclusiveRangeLength(startValue, endValue) {
    const numericStart = parseInt(startValue, 10);
    const numericEnd = parseInt(endValue, 10);
    return numericEnd - numericStart + 1;
}

function processData(rawData) {
    const inputLines = rawData.split("\n");
    let totalCount = 0;

    for (let lineIndex = 1; lineIndex < inputLines.length; lineIndex++) {
        const currentLine = inputLines[lineIndex];
        const rangeComponents = currentLine.split(" ");

        const segmentLength = calculateInclusiveRangeLength(
            rangeComponents[0],
            rangeComponents[1]
        );
        totalCount += segmentLength;
    }

    console.log(totalCount);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
processData(fileContent);
