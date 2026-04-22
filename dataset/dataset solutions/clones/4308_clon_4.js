'use strict'

const decipherText = (sourcePayload) => {
    const newlinePosition = sourcePayload.indexOf('\n');
    let relevantSegment;

    if (newlinePosition !== -1) {
        relevantSegment = sourcePayload.substring(0, newlinePosition);
    } else {
        relevantSegment = sourcePayload;
    }

    const terminalMarker = "FESTIVAL";
    // The original code implicitly assumes 'relevantSegment' ends with 'terminalMarker'.
    // If it didn't, the regex match would fail, leading to an error.
    // Therefore, we can safely proceed with removing the suffix.
    const extractedContent = relevantSegment.slice(0, relevantSegment.length - terminalMarker.length);
    
    console.log(extractedContent);
};

decipherText(require('fs').readFileSync('/dev/stdin', 'utf8'));