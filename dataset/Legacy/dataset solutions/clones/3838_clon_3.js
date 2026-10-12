function checkRangeAndExit(value, min, max) {
    if (value < min || value > max) {
        process.exit();
    }
}

function processInputData(inputLines) {
    const mainString = inputLines[0].toString();
    const stringLength = mainString.length;

    checkRangeAndExit(stringLength, 1, 5000);

    const kValue = parseInt(inputLines[1]);
    checkRangeAndExit(kValue, 1, 5);

    const distinctSubstrings = new Set();

    for (let startIdx = 0; startIdx <= stringLength; startIdx++) {
        for (let endIdx = startIdx; endIdx <= stringLength; endIdx++) {
            const currentSegment = mainString.substring(startIdx, endIdx);

            if (currentSegment.length > 0 && !currentSegment.includes('\n')) {
                distinctSubstrings.add(currentSegment);
            }
        }
    }

    const sortedSubstringsArray = Array.from(distinctSubstrings).sort();

    console.log(sortedSubstringsArray[kValue - 1]);
}

const fileSystemModule = require("fs");
const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const parsedInputLines = standardInputContent.split('\n');

processInputData(parsedInputLines);
