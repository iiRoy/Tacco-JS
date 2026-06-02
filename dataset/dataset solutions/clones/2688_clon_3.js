"use strict";

const processInput = rawInput => {
    const trimmedInput = rawInput.trim();
    const inputLines = trimmedInput.split("\n");
    const charSequence = inputLines[0].split("");

    let rCharCount = 0;
    let lCharCount = 0;
    let currentBoundaryIdx;
    let boundaryTransitionCount = 0;

    const sequenceLength = charSequence.length;
    const finalCounts = new Array(sequenceLength).fill(0);

    // Helper function to distribute accumulated counts to the result array
    const applySegmentDistribution = (rCnt, lCnt, boundaryPos, resultsArr) => {
        const segmentTotal = rCnt + lCnt;
        if (segmentTotal % 2 === 0) {
            resultsArr[boundaryPos] = segmentTotal / 2;
            resultsArr[boundaryPos + 1] = segmentTotal / 2;
        } else {
            // Preserve the exact original calculation for odd totals
            resultsArr[boundaryPos] = Math.ceil(lCnt / 2) + 1;
            resultsArr[boundaryPos + 1] = Math.ceil(rCnt / 2) + 1;
        }
    };

    // Iterate through the character sequence up to the second-to-last character
    for (let currentIndex = 0; currentIndex < sequenceLength - 1; currentIndex++) {
        const currentChar = charSequence[currentIndex];
        const nextChar = charSequence[currentIndex + 1];

        // Accumulate counts for 'R' and 'L' characters within the current segment
        if (currentChar === "R") {
            rCharCount++;
        } else if (currentChar === "L") {
            lCharCount++;
        }

        // Detect transitions between 'R' and 'L' characters
        if (currentChar !== nextChar) {
            boundaryTransitionCount++;
            // If this is the first transition in a sequence, mark the boundary index
            if (boundaryTransitionCount === 1) {
                currentBoundaryIdx = currentIndex;
            }
        }

        // If two transitions have occurred, it signifies the end of an R...RL...L segment
        if (boundaryTransitionCount === 2) {
            applySegmentDistribution(rCharCount, lCharCount, currentBoundaryIdx, finalCounts);

            // Reset counters for the next segment
            boundaryTransitionCount = 0;
            rCharCount = 0;
            lCharCount = 0;
        }

        // Special handling for the very last segment, triggered when processing the second-to-last character
        if (currentIndex === sequenceLength - 2) {
            // The original logic implicitly adds the last character (charSequence[sequenceLength - 1]) as an 'L'
            lCharCount++;

            applySegmentDistribution(rCharCount, lCharCount, currentBoundaryIdx, finalCounts);
        }
    }

    console.log(finalCounts.join(" "));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
