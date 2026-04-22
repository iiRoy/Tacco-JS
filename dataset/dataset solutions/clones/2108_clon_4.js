"use strict";

const processInput = (rawDataBundle) => {
    const dataLines = rawDataBundle.trim().split('\n');

    const initialCharacterSequence = dataLines[0].split('');
    const numberOfInstructions = parseInt(dataLines[1], 10);
    const instructionSet = dataLines.slice(2, 2 + numberOfInstructions);

    const stringManipulator = {
        leftSide: [], // Stores characters added to the effective front (needs reversal for display)
        rightSide: initialCharacterSequence, // Stores initial characters and those added to the effective back (in display order)
        isEffectivelyReversed: false // True if the string is conceptually reversed
    };

    for (let opIndex = 0; opIndex < numberOfInstructions; opIndex++) {
        const currentOperation = instructionSet[opIndex];
        const operationComponents = currentOperation.split(' ');

        if (operationComponents.length === 1) { // Command type 1: toggle reversal
            stringManipulator.isEffectivelyReversed = !stringManipulator.isEffectivelyReversed;
        } else { // Command type 2: add character
            const placementCode = operationComponents[1]; // "1" for front, "2" for back
            const characterValue = operationComponents[2];

            if (stringManipulator.isEffectivelyReversed) {
                // If the string is conceptually reversed:
                // Adding to the effective front means pushing to the 'rightSide' array.
                // Adding to the effective back means pushing to the 'leftSide' array.
                if (placementCode === '1') { // Add to effective front
                    stringManipulator.rightSide.push(characterValue);
                } else { // Add to effective back
                    stringManipulator.leftSide.push(characterValue);
                }
            } else {
                // If the string is in its normal conceptual orientation:
                // Adding to the effective front means pushing to the 'leftSide' array.
                // Adding to the effective back means pushing to the 'rightSide' array.
                if (placementCode === '1') { // Add to effective front
                    stringManipulator.leftSide.push(characterValue);
                } else { // Add to effective back
                    stringManipulator.rightSide.push(characterValue);
                }
            }
        }
    }

    let finalCharacterArray = [];
    if (stringManipulator.isEffectivelyReversed) {
        // If conceptually reversed, the final string is formed by:
        // 1. The 'rightSide' content (which received additions to the *effective* front) reversed.
        // 2. Concatenated with the 'leftSide' content (which received additions to the *effective* back) as is.
        finalCharacterArray = stringManipulator.rightSide.reverse().concat(stringManipulator.leftSide);
    } else {
        // If not conceptually reversed, the final string is formed by:
        // 1. The 'leftSide' content (which received additions to the *effective* front) reversed.
        // 2. Concatenated with the 'rightSide' content (which received initial characters and additions to the *effective* back) as is.
        finalCharacterArray = stringManipulator.leftSide.reverse().concat(stringManipulator.rightSide);
    }

    console.log(finalCharacterArray.join(''));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));