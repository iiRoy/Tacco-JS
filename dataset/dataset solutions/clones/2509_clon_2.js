"use strict";
const processInputData = ( initialData ) => {
    initialData = initialData
        .trim()
        .split(
            "\n"
        );
    const charSequence = initialData[0]
        .split(
            ""
        );
    const multiplier = parseInt(initialData[1]);

    let firstPassScore = 0;
    let secondPassScore = 0;

    // Handle edge case: single character input
    if (charSequence.length === 1) {
        console.log(
            Math.floor(multiplier / 2)
        );
        return;
    }

    let alteredSequence = [...charSequence];
    let startModifiedFlag = false;

    /*
     * This segment calculates consecutive character matches for the primary pattern.
     * It specifically addresses contiguous pairs and potential modifications to the sequence.
     */
    for (let index = 0; index < charSequence.length - 1; index++) {
        // Check if the current character is identical to the next one
        if (charSequence[index] === charSequence[index + 1] && index === charSequence.length - 2) {
            firstPassScore++;
            charSequence[index + 1] = "#"; // Mark the second character of the pair
            continue;
        }

        if (charSequence[index] === charSequence[index + 1]) {
            firstPassScore++;

            if (index !== 0) {
                charSequence[index + 1] = "&"; // Mark internal consecutive characters
            } else {
                charSequence[index] = "$"; // Mark the first character if it's the start of a streak
                startModifiedFlag = true;
            }
        }
    }

    let initialElement = charSequence[0];
    let finalElement = charSequence[charSequence.length - 1];

    // Conditional modification of sequence ends if they are identical
    if (initialElement === finalElement) {
        alteredSequence[0] = "~";
        alteredSequence[alteredSequence.length - 1] = "~";

        secondPassScore = 2;
    }

    /*
     * This part computes consecutive matches for a secondary pattern
     * using the potentially modified sequence.
     */
    for (let j = 0; j < alteredSequence.length - 1; j++) {
        // Evaluate adjacent characters for equality
        if (alteredSequence[j] === alteredSequence[j + 1]) {
            secondPassScore++;
            alteredSequence[j + 1] = "!"; // Mark the matched character
        }
    }

    let ultimateResult = 0;

    if (multiplier % 2 === 0) {
        ultimateResult = (firstPassScore + secondPassScore) * (multiplier / 2);
    } else {
        ultimateResult = (firstPassScore * Math.ceil(multiplier / 2)) + (secondPassScore * Math.floor(multiplier / 2));
    }

    console.log(ultimateResult);
};
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));