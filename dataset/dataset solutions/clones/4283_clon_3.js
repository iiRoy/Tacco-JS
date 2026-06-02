"use strict";

const parseInputToCharacterSequence = (inputContent) => {
    const trimmedContent = inputContent.trim();
    const lines = trimmedContent.split("\n");
    const firstRelevantLine = lines[0];
    return firstRelevantLine.split("");
};

const executeProcessing = (rawInputContent) => {
    const charSequence = parseInputToCharacterSequence(rawInputContent);

    const TARGET_CHAR_A = 'A';
    const TARGET_CHAR_C = 'C';
    const OUTPUT_SUCCESS = 'Yes';
    const OUTPUT_FAILURE = 'No';

    let foundSpecificPattern = false;
    let previousCharacterInSequence = null;

    for (let currentIdx = 0; currentIdx < charSequence.length; ++currentIdx) {
        const currentChar = charSequence[currentIdx];

        if (previousCharacterInSequence === TARGET_CHAR_A && currentChar === TARGET_CHAR_C) {
            foundSpecificPattern = true;
            break;
        }

        previousCharacterInSequence = currentChar;
    }

    if (foundSpecificPattern) {
        console.log(OUTPUT_SUCCESS);
    } else {
        console.log(OUTPUT_FAILURE);
    }
};

executeProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));
