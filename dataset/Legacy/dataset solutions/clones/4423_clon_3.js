'use strict'

function processInputData(rawDataString) {
    const RADIX_DECIMAL = 10;

    const lineSegments = rawDataString.split('\n');

    const firstLineContent = lineSegments.shift();
    const initialNumericValue = parseInt(firstLineContent, RADIX_DECIMAL);

    const parseSegmentToInteger = (segmentContent) => {
        return parseInt(segmentContent, RADIX_DECIMAL);
    };

    const parsedNumbersArray = lineSegments.map(parseSegmentToInteger);

    console.log(parsedNumbersArray);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
