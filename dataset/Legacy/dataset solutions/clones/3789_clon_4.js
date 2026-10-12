"use strict";
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const lineSegments = fileContent.split("\n");
const splitBoundary = Number(lineSegments[0]);
const targetSequence = lineSegments[1];

let maximalIntersectionCount = 0;

maximalIntersectionCount = Array.from({ length: splitBoundary - 1 }, (_, idx) => idx + 1)
    .reduce((currentHighest, divisionPoint) => {
        const initialSegment = targetSequence.slice(0, divisionPoint);
        const trailingSegment = targetSequence.slice(divisionPoint);

        const uniqueInitialChars = new Set(initialSegment);
        const trailingCharSet = new Set(trailingSegment);

        let commonUniqueCharCount = 0;
        for (const charElement of uniqueInitialChars) {
            if (trailingCharSet.has(charElement)) {
                commonUniqueCharCount++;
            }
        }
        return Math.max(currentHighest, commonUniqueCharCount);
    }, 0);

console.log(maximalIntersectionCount);
