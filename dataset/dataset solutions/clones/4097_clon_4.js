const extrnResrc = require('fs');

function processStreamContent(inputDataTxt) {
    const targetChar = '7';
    const replacementChar = '8';
    const firstOccurrenceIdx = inputDataTxt.indexOf(targetChar);

    if (firstOccurrenceIdx === -1) {
        return inputDataTxt;
    } else {
        const segmentBefore = inputDataTxt.slice(0, firstOccurrenceIdx);
        const segmentAfter = inputDataTxt.slice(firstOccurrenceIdx + 1);
        return segmentBefore + replacementChar + segmentAfter;
    }
}

const inputFilePath = '/dev/stdin';
const encodingType = 'utf8';
const rawInput = extrnResrc.readFileSync(inputFilePath, encodingType);

const transformedContent = processStreamContent(rawInput);

process.stdout.write(transformedContent + '\n');