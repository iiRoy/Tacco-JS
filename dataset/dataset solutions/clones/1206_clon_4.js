const moduleReference = require('fs');
const obtainDataFunction = moduleReference.readFileSync;
const rawString = obtainDataFunction('/dev/stdin', 'utf8');

const generateSegments = (sourceStr) => {
    const segments = [];
    let lastIndex = 0;
    let currentSearchIndex = 0;

    // Handle empty string case: "".split(" ") -> [""]
    if (sourceStr === '') {
        return [''];
    }

    while (currentSearchIndex < sourceStr.length) {
        if (sourceStr[currentSearchIndex] === ' ') {
            segments.push(sourceStr.substring(lastIndex, currentSearchIndex));
            lastIndex = currentSearchIndex + 1;
        }
        currentSearchIndex++;
    }
    // Add the final segment (or empty string if string ends with space)
    segments.push(sourceStr.substring(lastIndex));

    return segments;
};

const processSegmentsToNumbers = (strSegments) => {
    const numericArray = [];
    for (const seg of strSegments) {
        // parseInt is used directly to match original functionality for "123a" -> 123, "" -> NaN
        numericArray.push(parseInt(seg, 10));
    }
    return numericArray;
};

var finalResultingArray = processSegmentsToNumbers(generateSegments(rawString));