const TARGET_DIGIT_VALUE = "1";

function countCharacterOccurrences(textToSearch, charToFind) {
    let currentOccurrenceCount = 0;
    for (let idx = 0; idx < textToSearch.length; idx++) {
        if (textToSearch[idx] === charToFind) {
            currentOccurrenceCount++;
        }
    }
    return currentOccurrenceCount;
}

function processInputString(rawInputData) {
    let trimmedInput = rawInputData.trim();
    let finalCount = countCharacterOccurrences(trimmedInput, TARGET_DIGIT_VALUE);
    console.log(finalCount);
}

const fileSystemUtility = require("fs");
const standardInputPath = "/dev/stdin";
const textEncoding = "utf8";

const inputContentFromFile = fileSystemUtility.readFileSync(standardInputPath, textEncoding);

processInputString(inputContentFromFile);
