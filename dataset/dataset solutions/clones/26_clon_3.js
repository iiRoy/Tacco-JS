process.stdin.resume();
process.stdin.setEncoding('utf8');

function performStringReversal(inputStringValue) {
    const characterArray = inputStringValue.split("");
    const reversedCharacterArray = characterArray.reverse();
    const finalReversedString = reversedCharacterArray.join("");
    return finalReversedString;
}

const fileSystemModuleReference = require('fs');
const standardInputFilePath = '/dev/stdin';
const inputEncodingType = 'utf8';

const rawInputContent = fileSystemModuleReference.readFileSync(standardInputFilePath, inputEncodingType);
const allInputLines = rawInputContent.split("\n");
const firstRelevantLine = allInputLines[0];

const resultString = performStringReversal(firstRelevantLine);
console.log(resultString);
