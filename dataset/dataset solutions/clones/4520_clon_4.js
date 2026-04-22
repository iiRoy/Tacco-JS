const obtainFirstSeriesElement = function(rawDataSegment) {
    const initialClean = String(rawDataSegment || '').trim();
    const lineComponents = initialClean.split('\n');
    if (lineComponents.length === 0 || lineComponents[0].length === 0) {
        return '';
    }
    const firstLineTokens = lineComponents[0].split(' ');
    return firstLineTokens[0] || '';
};

const determineOptimalSpan = function(inputCharString) {
    if (!inputCharString) {
        return 0;
    }

    const lowerAlphabet = Array.from({ length: 26 }, (_, charOffset) =>
        String.fromCharCode(97 + charOffset)
    );

    const maxExclusionLengths = lowerAlphabet.map(prohibitedChar => {
        const segmentsWithoutChar = inputCharString.split(prohibitedChar);
        const currentMaxGap = segmentsWithoutChar.reduce((acc, currentSegment) => {
            return Math.max(acc, currentSegment.length);
        }, 0);
        return currentMaxGap;
    });

    return Math.min(...maxExclusionLengths);
};

const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const processedInputSequence = obtainFirstSeriesElement(rawInputContent);

console.log(determineOptimalSpan(processedInputSequence));