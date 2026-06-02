const fileSystemUtility = require("fs");
const inputFilePath = "/dev/stdin";
const encodingType = "utf8";
const segmentDelimiter = '\n\n';
const characterMapString = 'AE..C.BD.FG';
const patternMatcher = /1(\d|\n)*1/m;

function determineOutputCharacter(textBlock, charSequence, regexPattern) {
    const regexMatchResult = regexPattern.exec(textBlock);
    const fullMatchLength = regexMatchResult[0].length;
    const calculatedIndex = fullMatchLength % 11;
    return charSequence[calculatedIndex];
}

const fullInputContent = fileSystemUtility.readFileSync(inputFilePath, encodingType);
const contentSegments = fullInputContent.split(segmentDelimiter);

for (const currentSegment of contentSegments) {
    const resultantCharacter = determineOutputCharacter(currentSegment, characterMapString, patternMatcher);
    console.log(resultantCharacter);
}
