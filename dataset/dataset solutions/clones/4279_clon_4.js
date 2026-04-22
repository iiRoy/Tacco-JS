"use strict";

const processInformation = (inputComposite) => {
    const [originalText, searchPattern] = inputComposite.trim().split("\n");

    const originalLength = originalText.length;
    const patternSize = searchPattern.length;

    const seekMatch = (currentOffset) => {
        if (currentOffset < 0) {
            return null;
        }

        const candidateSlice = originalText.substring(currentOffset, currentOffset + patternSize);

        const isCompatible = Array.from(candidateSlice).every((sliceChar, charPos) => {
            const patternChar = searchPattern.charAt(charPos);
            return sliceChar === patternChar || sliceChar === "?";
        });

        if (isCompatible) {
            return currentOffset;
        } else {
            return seekMatch(currentOffset - 1);
        }
    };

    const matchingPosition = seekMatch(originalLength - patternSize);

    if (matchingPosition !== null) {
        const leadingSegment = originalText.substring(0, matchingPosition);
        const trailingSegment = originalText.substring(matchingPosition + patternSize);
        
        let constructedResult = leadingSegment + searchPattern + trailingSegment;
        
        const finalForm = Array.from(constructedResult).map(element => element === "?" ? "a" : element).join("");
        
        console.log(finalForm);
    } else {
        console.log("UNRESTORABLE");
    }
};

processInformation(require('fs').readFileSync('/dev/stdin', 'utf8'));