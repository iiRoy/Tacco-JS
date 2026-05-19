const fileSystem = require('fs');

const EGG_IDENTIFIER = "egg";
const CHICKEN_IDENTIFIER = "chicken";
const E_REPLACEMENT_CHAR = "E";
const C_REPLACEMENT_CHAR = "C";
const SPLIT_DELIMITER_CHAR = "A";
const STANDARD_INPUT_FILE_PATH = '/dev/stdin';

const rawInputData = fileSystem.readFileSync(STANDARD_INPUT_FILE_PATH, 'utf8');

const cleanedInputString = rawInputData.trim();

let firstPassTransformedString = cleanedInputString.replace(new RegExp(EGG_IDENTIFIER, 'g'), E_REPLACEMENT_CHAR);
firstPassTransformedString = firstPassTransformedString.replace(new RegExp(CHICKEN_IDENTIFIER, 'g'), C_REPLACEMENT_CHAR);

const secondPassTransformedString = firstPassTransformedString
    .replace(new RegExp(E_REPLACEMENT_CHAR + E_REPLACEMENT_CHAR, 'g'), E_REPLACEMENT_CHAR + SPLIT_DELIMITER_CHAR + E_REPLACEMENT_CHAR)
    .replace(new RegExp(C_REPLACEMENT_CHAR + C_REPLACEMENT_CHAR, 'g'), C_REPLACEMENT_CHAR + SPLIT_DELIMITER_CHAR + C_REPLACEMENT_CHAR);

const contentSegmentsArray = secondPassTransformedString.split(SPLIT_DELIMITER_CHAR);

const longestContentSegment = contentSegmentsArray.reduce((currentLongest, segment) => {
    return (segment.length > currentLongest.length) ? segment : currentLongest;
}, "");

const lastCharacterOfLongest = longestContentSegment.slice(-1);
let finalOutputMessage;

if (lastCharacterOfLongest === E_REPLACEMENT_CHAR) {
    finalOutputMessage = EGG_IDENTIFIER;
} else {
    finalOutputMessage = CHICKEN_IDENTIFIER;
}

console.log(finalOutputMessage);
