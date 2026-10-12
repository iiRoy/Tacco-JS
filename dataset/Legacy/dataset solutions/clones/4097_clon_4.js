const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingFormat = 'utf8';

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, encodingFormat);

const searchCharacter = '7';
const substituteCharacter = '8';

const firstOccurrencePosition = rawInputContent.indexOf(searchCharacter);

let finalOutputString;
if (firstOccurrencePosition !== -1) {
    const prefixSegment = rawInputContent.substring(0, firstOccurrencePosition);
    const suffixSegment = rawInputContent.substring(firstOccurrencePosition + 1);
    finalOutputString = prefixSegment + substituteCharacter + suffixSegment;
} else {
    finalOutputString = rawInputContent;
}

console.log(finalOutputString);
