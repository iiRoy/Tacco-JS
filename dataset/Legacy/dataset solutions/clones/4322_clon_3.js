const maxSafeIntVal = Number.MAX_SAFE_INTEGER;
const LINE_DELIMITER = "\n";
const SEGMENT_DELIMITER = " ";
const START_LINE_OFFSET = 1;

function processLineForMax(lineContent, currentMaxEntry) {
    const entrySegments = lineContent.split(SEGMENT_DELIMITER);
    const firstValue = Number(entrySegments[0]);
    const secondValue = Number(entrySegments[1]);

    if (firstValue > currentMaxEntry[0]) {
        return [firstValue, secondValue];
    } else {
        return currentMaxEntry;
    }
}

function processInputData(rawInputString) {
    let currentMaxEntry = [0, maxSafeIntVal];
    const inputLines = rawInputString.split(LINE_DELIMITER);
    const totalInputLines = inputLines.length;

    for (let lineIdx = START_LINE_OFFSET; lineIdx < totalInputLines; lineIdx++) {
        const currentLine = inputLines[lineIdx];
        currentMaxEntry = processLineForMax(currentLine, currentMaxEntry);
    }

    const firstComponentValue = currentMaxEntry[0];
    const secondComponentValue = currentMaxEntry[1];
    const finalSumResult = firstComponentValue + secondComponentValue;

    console.log(finalSumResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
