"use strict";

const processInput = rawInput => {
    rawInput = rawInput.trim().split("\n");
    const characterSequence = rawInput[0].split("");

    const PRIME_MODULUS = 1_000_000_007;

    let stateTable = [];

    // The stateTable[digitPosition][remainderValue] stores the count of valid numbers
    // formed by the first 'digitPosition' digits that yield 'remainderValue' when divided by thirteen.
    for (
        let charIdx = 0;
        charIdx <= characterSequence.length;
        charIdx++
    ) {
        stateTable.push(new Array(13).fill(0));
    }

    stateTable[0][0] = 1;

    for (let currentPos = 0; currentPos < characterSequence.length; currentPos++) {
        const digitChar = characterSequence[currentPos];
        const currentDigitVal = (digitChar === "?") ? -1 : Number.parseInt(digitChar);

        for (
            let candidateDigit = 0;
            candidateDigit <= 9;
            candidateDigit++
        ) {
            if (currentDigitVal !== -1 && currentDigitVal !== candidateDigit) {
                continue;
            }

            for (
                let previousRemainder = 0;
                previousRemainder < 13;
                previousRemainder++
            ) {
                const newRemainder = (previousRemainder * 10 + candidateDigit) % 13;
                stateTable[currentPos + 1][newRemainder] += stateTable[currentPos][previousRemainder];
            }
        }

        // Apply modulo operation to prevent overflow for the current position's counts
        for (
            let remainder = 0;
            remainder < 13;
            remainder++
        ) {
            stateTable[currentPos + 1][remainder] %= PRIME_MODULUS;
        }
    }

    console.log(stateTable[characterSequence.length][5]);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));