'use strict';

function processInput(textualData) {
    const lines = textualData.split('\n');
    const charCount = Number(lines[0]);
    const charSequence = lines[1];

    const splitPointIndices = Array.from({ length: charCount - 1 }, (_, index) => index + 1);

    const intersectionSizes = splitPointIndices.map(currentSplitIndex => {
        const leftSegment = charSequence.substring(0, currentSplitIndex);
        const rightSegment = charSequence.substring(currentSplitIndex);

        const uniqueLeftSet = new Set(leftSegment);
        const uniqueRightSet = new Set(rightSegment);

        let currentIntersectionCount = 0;
        for (const character of uniqueLeftSet) {
            if (uniqueRightSet.has(character)) {
                currentIntersectionCount++;
            }
        }
        return currentIntersectionCount;
    });

    const maximumIntersection = Math.max(...intersectionSizes);

    console.log(maximumIntersection);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
