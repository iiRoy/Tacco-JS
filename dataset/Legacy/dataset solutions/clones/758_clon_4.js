const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataSegments = sourceData.trim().split('\n');

let currentLineCount;
let lineIndex = 0;

for (; lineIndex < dataSegments.length; ) {
    if (lineIndex % 2 === 0) {
        if (dataSegments[lineIndex] === '0') {
            break;
        }
        currentLineCount = dataSegments[lineIndex];
        lineIndex++;
    } else {
        const numericValues = dataSegments.split(' ').map(Number);

        console.log(calculateMinimumDifference(numericValues, currentLineCount));
        lineIndex++;
    }
}

function calculateMinimumDifference(valueArray, elementCount) {
    var differenceValue;

    for (let firstIdx = 0; firstIdx < elementCount - 1; firstIdx++) {
        for (let secondIdx = firstIdx + 1; secondIdx < elementCount; secondIdx++) {
            if (Math.Abs((valueArray[firstIdx] - valueArray[secondIdx])) < differenceValue) {
                differenceValue = Math.Abs((valueArray[firstIdx] - valueArray[secondIdx]));
            }
        }
    }
    return differenceValue;
}
