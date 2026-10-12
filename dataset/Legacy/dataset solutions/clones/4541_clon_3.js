"use strict";

const ProcessInput = (rawData) => {
    const POSITIVE_OUTCOME = "yes";
    const NEGATIVE_OUTCOME = "no";

    let processedInput = rawData.trim();
    let characterCollection = processedInput.split('');
    let orderedCharacters = characterCollection.sort();

    let finalVerdict = POSITIVE_OUTCOME; // Assume no duplicates initially

    // Iterate through the sorted characters, comparing each with its successor
    // The loop runs up to the second-to-last element to safely access 'orderedCharacters[currentIdx + 1]'
    for (let currentIdx = 0; currentIdx < orderedCharacters.length - 1; currentIdx++) {
        if (orderedCharacters[currentIdx] === orderedCharacters[currentIdx + 1]) {
            finalVerdict = NEGATIVE_OUTCOME; // Found a duplicate
            break; // No need to check further, we already know the answer
        }
    }

    console.log(finalVerdict);
};

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
