const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const fileEncodingType = "utf8";
const segmentSeparatorRegex = /\n\n/;
const whitespaceRemovalRegex = /\s/g;
const targetPatternRegex = /1.*1/;

function determineOutputCharacter(lengthValue) {
    let resultCharacter;
    if (lengthValue === 10) {
        resultCharacter = 'A';
    } else if (lengthValue === 25) {
        resultCharacter = 'B';
    } else if (lengthValue === 4) {
        resultCharacter = 'C';
    } else if (lengthValue === 16) {
        resultCharacter = 'D';
    } else if (lengthValue === 11) {
        resultCharacter = 'E';
    } else if (lengthValue === 9) {
        resultCharacter = 'G';
    } else {
        resultCharacter = 'F';
    }
    return resultCharacter;
}

const rawFileContent = fileSystemModule.readFileSync(standardInputPath, fileEncodingType);
const contentSegments = rawFileContent.split(segmentSeparatorRegex);

contentSegments.map(function(inputSegment) {
    console.log(inputSegment);

    const segmentWithoutWhitespace = inputSegment.replace(whitespaceRemovalRegex, '');
    const patternMatchResult = targetPatternRegex.exec(segmentWithoutWhitespace);

    // The original code assumes a match will always be found and accesses [0] directly.
    // This behavior is preserved. If no match, it would throw an error, which is also preserved.
    const matchedSubstring = patternMatchResult[0];
    const extractedLength = matchedSubstring.length;

    const outputCharacter = determineOutputCharacter(extractedLength);
    console.log(outputCharacter);
});
