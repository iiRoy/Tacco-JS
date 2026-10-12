'use strict';

const fileSystem = require("fs");
const inputFilePath = "/dev/stdin";
const rawInputContent = fileSystem.readFileSync(inputFilePath, "utf8");
const characterSequence = rawInputContent.split("");

const POSITIVE_OUTCOME = "Yes";
const NEGATIVE_OUTCOME = "No";

let finalResult = POSITIVE_OUTCOME;

// Helper function to count occurrences of a specific character within an array
const determineCharacterCount = (sourceCollection, soughtCharacter) => {
  let currentTally = 0;
  for (let collectionIndex = 0; collectionIndex < sourceCollection.length; collectionIndex++) {
    if (sourceCollection[collectionIndex] === soughtCharacter) {
      currentTally++;
    }
  }
  return currentTally;
};

// Iterate through each character in the sequence
for (let primaryIndex = 0; primaryIndex < characterSequence.length; primaryIndex++) {
  const characterToEvaluate = characterSequence[primaryIndex];
  const frequencyOfCharacter = determineCharacterCount(characterSequence, characterToEvaluate);

  // If any character appears an odd number of times, the condition is not met
  if (frequencyOfCharacter % 2 !== 0) {
    finalResult = NEGATIVE_OUTCOME;
    break; // Exit the loop early as the condition is already violated
  }
}

console.log(finalResult);
