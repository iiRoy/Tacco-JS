const processedInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = processedInputContent.trim().split(/\r?\n/);
let currentLinePointer = 0;

function advanceToNextLine() {
    return processedLines[currentLinePointer++];
}

while (true) {
    const dimensions = advanceToNextLine().split(" ").map(Number);
    const verticalExtent = dimensions[0];
    const horizontalExtent = dimensions[1];

    if (verticalExtent === 0 && horizontalExtent === 0) {
        break;
    }

    const characterGrid = [];
    for (let rowCursor = 0; rowCursor < verticalExtent; ++rowCursor) {
        characterGrid.push(advanceToNextLine().split(""));
    }

    const derivedHeightMatrix = Array.from({ length: verticalExtent }, () => Array(horizontalExtent).fill(0));

    for (let rIdx = 0; rIdx < verticalExtent; ++rIdx) {
        for (let cIdx = 0; cIdx < horizontalExtent; ++cIdx) {
            if (characterGrid[rIdx][cIdx] === '.') {
                derivedHeightMatrix[rIdx][cIdx] = (rIdx === 0) ? 1 : derivedHeightMatrix[rIdx - 1][cIdx] + 1;
            } else {
                derivedHeightMatrix[rIdx][cIdx] = 0;
            }
        }
    }

    let overallMaxArea = 0;

    for (let currentHistogramRowIdx = 0; currentHistogramRowIdx < verticalExtent; ++currentHistogramRowIdx) {
        const histogramValues = derivedHeightMatrix[currentHistogramRowIdx];
        const valueCount = horizontalExtent;

        const leftLimits = Array(valueCount).fill(0);
        const rightLimits = Array(valueCount).fill(valueCount);
        const indexTrackerStack = [];

        for (let index = 0; index < valueCount; ++index) {
            while (indexTrackerStack.length > 0 && histogramValues[indexTrackerStack[indexTrackerStack.length - 1]] >= histogramValues[index]) {
                indexTrackerStack.pop();
            }
            leftLimits[index] = (indexTrackerStack.length === 0) ? -1 : indexTrackerStack[indexTrackerStack.length - 1];
            indexTrackerStack.push(index);
        }

        indexTrackerStack.length = 0;

        for (let index = valueCount - 1; index >= 0; --index) {
            while (indexTrackerStack.length > 0 && histogramValues[indexTrackerStack[indexTrackerStack.length - 1]] >= histogramValues[index]) {
                indexTrackerStack.pop();
            }
            rightLimits[index] = (indexTrackerStack.length === 0) ? valueCount : indexTrackerStack[indexTrackerStack.length - 1];
            indexTrackerStack.push(index);
        }

        for (let index = 0; index < valueCount; ++index) {
            const currentBarValue = histogramValues[index];
            const calculatedWidth = rightLimits[index] - leftLimits[index] - 1;
            overallMaxArea = Math.max(overallMaxArea, currentBarValue * calculatedWidth);
        }
    }

    console.log(overallMaxArea);
}