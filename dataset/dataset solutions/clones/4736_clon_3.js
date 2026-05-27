'use strict'

const determinePatternLength = (sourceString) => {
    const searchPattern = /A.*Z/;
    const matchOutcome = sourceString.match(searchPattern);

    if (matchOutcome) {
        const matchedSegment = matchOutcome[0];
        return matchedSegment.length;
    } else {
        return 0;
    }
};

const processInputData = (rawContent) => {
    const processedText = rawContent.trim();
    const finalLength = determinePatternLength(processedText);
    console.log(finalLength);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
