const fs = require('fs');

const DOT_CHARACTER = '.';
const MIN_TOKEN_LENGTH = 3;
const MAX_TOKEN_LENGTH = 6;
const WHITESPACE_SPLIT_REGEX = /\s/;
const COMMA_REPLACE_REGEX = /,/g;
const DOT_REPLACE_REGEX = /\./g;

function isLengthWithinBounds(len) {
    return len >= MIN_TOKEN_LENGTH && len <= MAX_TOKEN_LENGTH;
}

let rawInputContent = fs.readFileSync('/dev/stdin', 'utf8');
let cleanedInputContent = rawInputContent.replace(COMMA_REPLACE_REGEX, "");
let trimmedInputContent = cleanedInputContent.trim();
let inputWordTokens = trimmedInputContent.split(WHITESPACE_SPLIT_REGEX);

let resultSegments = [];
let currentAccumulatedString = "";

for (let currentTokenIndex = 0; currentTokenIndex < inputWordTokens.length; currentTokenIndex++) {
    let currentWord = inputWordTokens[currentTokenIndex];
    let wordContentWithoutDots = currentWord.replace(DOT_REPLACE_REGEX, "");
    let containsDotInWord = wordContentWithoutDots.length < currentWord.length;

    if (containsDotInWord) {
        let effectiveWordLength = wordContentWithoutDots.length;

        if (isLengthWithinBounds(effectiveWordLength)) {
            if (currentWord.endsWith(DOT_CHARACTER)) {
                currentAccumulatedString += wordContentWithoutDots;
                resultSegments.push(currentAccumulatedString);
            } else {
                currentAccumulatedString += currentWord;
            }
            currentAccumulatedString = "";
        } else {
            resultSegments.push(currentAccumulatedString);
            currentAccumulatedString = "";
        }
    } else {
        if (isLengthWithinBounds(currentWord.length)) {
            currentAccumulatedString += currentWord + " ";
        }
    }
}

for (let segmentOutputIndex = 0; segmentOutputIndex < resultSegments.length; segmentOutputIndex++) {
    console.log(resultSegments[segmentOutputIndex]);
}
