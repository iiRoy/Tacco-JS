'use strict';

// This function processes the given raw data to determine if a word chain is valid.
const processInput = (rawData) => {
    // Split the input by newline and remove the first line (which is the count).
    const wordList = rawData.split('\n').slice(1);

    // Initialize a variable to store the last character of the previous word.
    let previousEndingChar = null;

    // Use an object to keep track of words that have already appeared.
    const seenWords = {};

    // Assume the chain is valid until proven otherwise.
    let isChainValid = true;

    // Iterate over each word in the list.
    wordList.forEach(currentWord => {
        // Check if the current word has been seen before.
        if (typeof seenWords[currentWord] !== 'undefined') {
            isChainValid = false; // If so, the chain is invalid.
        }

        // Extract the first character of the current word.
        const currentStartingChar = currentWord.substr(0, 1);
        // Extract the last character of the current word.
        const currentEndingChar = currentWord.substr(-1);

        // If this is not the first word and the previous word's last char
        // does not match the current word's first char, the chain is invalid.
        if (previousEndingChar !== null && previousEndingChar !== currentStartingChar) {
            isChainValid = false;
        }

        // Update the previous ending character for the next iteration.
        previousEndingChar = currentEndingChar;

        // Mark the current word as seen.
        seenWords[currentWord] = true;
    });

    // Output "Yes" if the chain is valid, "No" otherwise.
    console.log(isChainValid ? 'Yes' : 'No');
};

// A flag to control whether test cases are run or standard input is used.
const runTestCases = false;

if (runTestCases) {
    // Example test case 1: Invalid chain due to repeated word and broken link.
    processInput('4\nhoge\nenglish\nhoge\nenigma');
    // Example test case 2: Valid chain.
    processInput('9\nbasic\nc\ncpp\nphp\npython\nnadesico\nocaml\nlua\nassembly');
} else {
    // Read input from standard input for production use.
    processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
