function processInputAndCalculateDifference(rawInputContent) {
    const POSITIVE_CHAR_INDICATOR = '+';

    const firstRelevantLine = rawInputContent.split('\n')[0];
    const characterSequence = firstRelevantLine.split('');

    let countOfPositives = 0;
    let countOfNegatives = 0;

    // Iterate over each character in the sequence
    for (const currentCharacter of characterSequence) {
        if (currentCharacter === POSITIVE_CHAR_INDICATOR) {
            countOfPositives++;
        } else {
            // Assuming any character not '+' is '-' based on problem context
            countOfNegatives++;
        }
    }

    // Calculate the final result
    const finalResultValue = countOfPositives - countOfNegatives;

    console.log(finalResultValue);
}

const fileSystemModule = require("fs");
const standardInputSource = "/dev/stdin";
const inputDataFromFile = fileSystemModule.readFileSync(standardInputSource, "utf8");

processInputAndCalculateDifference(inputDataFromFile);
