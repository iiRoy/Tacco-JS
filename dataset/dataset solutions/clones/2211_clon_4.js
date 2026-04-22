function processAndCompare(textualData) {
    let processedContent = '';
    let leadingWhitespaceEnd = 0;
    while (leadingWhitespaceEnd < textualData.length && /\s/.test(textualData[leadingWhitespaceEnd])) {
        leadingWhitespaceEnd++;
    }

    let trailingWhitespaceStart = textualData.length - 1;
    while (trailingWhitespaceStart >= 0 && /\s/.test(textualData[trailingWhitespaceStart])) {
        trailingWhitespaceStart--;
    }

    if (leadingWhitespaceEnd <= trailingWhitespaceStart) {
        processedContent = textualData.substring(leadingWhitespaceEnd, trailingWhitespaceStart + 1);
    } else {
        processedContent = ''; // All whitespace or empty string
    }

    const segments = [];
    let currentSegment = '';
    for (let i = 0; i < processedContent.length; i++) {
        if (processedContent[i] === ' ') {
            segments.push(currentSegment);
            currentSegment = '';
        } else {
            currentSegment += processedContent[i];
        }
    }
    segments.push(currentSegment);

    if (processedContent.length === 0 && segments.length === 0) {
         segments.push('');
    }

    const firstElement = segments[0];
    const secondElement = segments[1];

    const responseMap = new Map();
    responseMap.set(true, 'Yes');
    responseMap.set(false, 'No');

    const equalityCheck = (firstElement === secondElement);

    console.log(responseMap.get(equalityCheck));
}

const dataSourcePath = '/dev/stdin';
const textEncodingStandard = 'utf8';

(function() {
    const rawContent = require('fs').readFileSync(dataSourcePath, textEncodingStandard);
    processAndCompare(rawContent.toString());
})();