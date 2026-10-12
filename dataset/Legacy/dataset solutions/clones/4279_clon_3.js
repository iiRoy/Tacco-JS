"use strict";

const checkPatternMatch = (segment, pattern) => {
    const patternLength = pattern.length;
    for (let charIdx = 0; charIdx < patternLength; charIdx++) {
        const segmentChar = segment[charIdx];
        const patternChar = pattern[charIdx];
        if (segmentChar !== patternChar && segmentChar !== "?") {
            return false;
        }
    }
    return true;
};

const processInput = (inputString) => {
    const trimmedInput = inputString.trim();
    const inputLines = trimmedInput.split("\n");

    const sourceStr = inputLines[0];
    const targetStr = inputLines[1];

    const targetLength = targetStr.length;
    const sourceLength = sourceStr.length;

    const WILDCARD_REPLACEMENT_CHAR = "a";

    const maxPossibleStartIndex = sourceLength - targetLength;

    for (let startIndex = maxPossibleStartIndex; startIndex >= 0; startIndex--) {
        const currentSubstr = sourceStr.slice(startIndex, startIndex + targetLength);

        const matchFound = checkPatternMatch(currentSubstr, targetStr);

        if (matchFound) {
            const prefixSegment = sourceStr.substring(0, startIndex);
            const suffixStartPoint = startIndex + targetLength;
            const suffixSegment = sourceStr.substring(suffixStartPoint);

            let resultStr = `${prefixSegment}${targetStr}${suffixSegment}`;
            
            resultStr = resultStr.replace(/\?/g, WILDCARD_REPLACEMENT_CHAR);
            
            console.log(resultStr);
            return;
        }
    }
    
    console.log("UNRESTORABLE");
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
