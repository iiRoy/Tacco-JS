'use strict';

const fileSystem = require("fs");
const inputPath = "/dev/stdin";

const NEGATIVE_VERDICT_STRING = "No";
const POSITIVE_VERDICT_STRING = "Yes";

// Helper function to check if a given number is odd
const isNumberOdd = (numericValue) => {
    return (numericValue % 2 !== 0);
};

// Helper function to calculate the frequency of a specific character within an array of characters
const calculateCharacterFrequency = (targetCharacter, characterSequence) => {
    let currentFrequency = 0;
    for (const sequenceElement of characterSequence) {
        if (sequenceElement === targetCharacter) {
            currentFrequency++;
        }
    }
    return currentFrequency;
};

const rawInputContent = fileSystem.readFileSync(inputPath, "utf8");
const inputCharacterSequence = rawInputContent.split("");

let finalOutcome = POSITIVE_VERDICT_STRING; // Default assumption is "Yes"

// Iterate through each character in the input sequence to check its parity
for (let currentCharacterIndex = 0; currentCharacterIndex < inputCharacterSequence.length; currentCharacterIndex++) {
    const characterToEvaluate = inputCharacterSequence[currentCharacterIndex];
    const characterOccurrences = calculateCharacterFrequency(characterToEvaluate, inputCharacterSequence);

    // If the count of any character is odd, the condition is not met
    if (isNumberOdd(characterOccurrences)) {
        finalOutcome = NEGATIVE_VERDICT_STRING;
        break; // No need to check further, we already found a violation
    }
}

console.log(finalOutcome);
