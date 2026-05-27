'use strict';

const processInputData = (rawData) => {
    const LINE_DELIMITER = '\n';
    const allInputLines = rawData.split(LINE_DELIMITER);
    const actualWordSequence = allInputLines.slice(1);

    let previousWordEndChar = null;
    const encounteredWordsRegistry = {};
    let isChainValid = true;

    const WORD_MARKER_VALUE = true;

    for (const currentWord of actualWordSequence) {
        // Check for duplicate words
        if (encounteredWordsRegistry[currentWord] === WORD_MARKER_VALUE) {
            isChainValid = false;
        }

        const currentWordStartChar = currentWord[0];
        const currentWordEndChar = currentWord[currentWord.length - 1];

        // Check if the current word's start character matches the previous word's end character
        if (previousWordEndChar !== null && previousWordEndChar !== currentWordStartChar) {
            isChainValid = false;
        }

        // Update the previous word's end character for the next iteration
        previousWordEndChar = currentWordEndChar;
        // Mark the current word as encountered
        encounteredWordsRegistry[currentWord] = WORD_MARKER_VALUE;
    }

    console.log(isChainValid ? 'Yes' : 'No');
};

const isDevelopmentMode = false;

if (isDevelopmentMode) {
    processInputData('4\nhoge\nenglish\nhoge\nenigma');
    processInputData('9\nbasic\nc\ncpp\nphp\npython\nnadesico\nocaml\nlua\nassembly');
} else {
    processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
