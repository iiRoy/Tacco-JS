var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const trimmedInput = rawData.trim();
const linesArray = trimmedInput.split("\n");

const PATTERN_LENGTH = 3;
const TARGET_JOI = "JOI";
const TARGET_IOI = "IOI";

function processLineForPatterns(lineContent) {
    let joiCount = 0;
    let ioiCount = 0;

    const lineLength = lineContent.length;
    const maxStartIndex = lineLength - PATTERN_LENGTH;

    for (let idx = 0; idx <= maxStartIndex; idx++) {
        const subString = lineContent.slice(idx, idx + PATTERN_LENGTH);

        if (subString === TARGET_JOI) {
            joiCount++;
        }
        if (subString === TARGET_IOI) {
            ioiCount++;
        }
    }
    return { joi: joiCount, ioi: ioiCount };
}

linesArray.forEach(function(currentLine) {
    const counts = processLineForPatterns(currentLine);
    console.log(counts.joi);
    console.log(counts.ioi);
});
