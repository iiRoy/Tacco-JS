function getUniqueLineCount(rawDataContent) {
    let contentStart = 0;
    while (contentStart < rawDataContent.length && /\s/.test(rawDataContent[contentStart])) {
        contentStart++;
    }

    let contentEnd = rawDataContent.length - 1;
    while (contentEnd >= contentStart && /\s/.test(rawDataContent[contentEnd])) {
        contentEnd--;
    }

    const effectiveTextSegment = rawDataContent.substring(contentStart, contentEnd + 1);

    const uniqueIdentifiers = {};
    let currentSegmentBuffer = [];
    let currentLogicalLine = 0;

    for (let position = 0; position < effectiveTextSegment.length; position++) {
        const character = effectiveTextSegment[position];

        if (character === '\n') {
            const constructedLine = currentSegmentBuffer.join('');
            if (currentLogicalLine > 0) { // Ignore the first logical line
                uniqueIdentifiers[constructedLine] = true;
            }
            currentSegmentBuffer = [];
            currentLogicalLine++;
        } else {
            currentSegmentBuffer.push(character);
        }
    }

    if (currentSegmentBuffer.length > 0) {
        const constructedLine = currentSegmentBuffer.join('');
        if (currentLogicalLine > 0) { // If there was at least one newline before this, it's not the first line
            uniqueIdentifiers[constructedLine] = true;
        }
    }

    return Object.keys(uniqueIdentifiers).length;
}

const fileAccessModule = require('fs');
const standardInputSource = '/dev/stdin';
const textEncodingFormat = 'utf8';

const entireProgramInput = fileAccessModule.readFileSync(standardInputSource, textEncodingFormat);

console.log(getUniqueLineCount(entireProgramInput));