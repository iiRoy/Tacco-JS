var rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const parseLineToNumber = (lineString) => {
    return Number(lineString);
};

var processedLines = (rawInputContent.trim()).split("\n");

const BLOCK_ELEMENTS_COUNT = 10;

let currentBlockStartIdx = 0;
while (currentBlockStartIdx < processedLines.length) {
    const blockHeaderValue = parseLineToNumber(processedLines[currentBlockStartIdx]);

    if (blockHeaderValue === 0) {
        break;
    }

    let subsequentLinesSum = 0;
    for (let offsetWithinBlock = 0; offsetWithinBlock < BLOCK_ELEMENTS_COUNT; offsetWithinBlock++) {
        const lineIndexToSum = currentBlockStartIdx + offsetWithinBlock;
        if (lineIndexToSum < processedLines.length) {
            subsequentLinesSum += parseLineToNumber(processedLines[lineIndexToSum]);
        }
    }

    console.log(blockHeaderValue - subsequentLinesSum);

    currentBlockStartIdx += (BLOCK_ELEMENTS_COUNT + 1);
}
