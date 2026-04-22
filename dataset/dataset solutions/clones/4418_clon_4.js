"use strict";

const processSegments = (sourceText) => {
    const rawParts = sourceText.trim().split(/\s+/);
    const numericalComponents = [];
    for (const part of rawParts) {
        numericalComponents.push(Number(part));
    }

    const [startOne, endOne, startTwo, endTwo] = numericalComponents;

    let totalOverlapExtent;

    if (endOne < startTwo || endTwo < startOne) {
        totalOverlapExtent = 0;
    } else {
        const commonBeginning = Math.max(startOne, startTwo);
        const commonEnding = Math.min(endOne, endTwo);
        totalOverlapExtent = commonEnding - commonBeginning;
    }
    
    console.info(totalOverlapExtent);
};

processSegments(require('node:fs').readFileSync('/dev/stdin','utf8'));