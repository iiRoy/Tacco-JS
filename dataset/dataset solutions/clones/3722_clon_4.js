"use strict";

function processInput(rawData) {
    const initialValue = Number(rawData.split('\n')[0]);

    const totalOfDigits = String(initialValue)
        .split('')
        .map(character => parseInt(character, 10))
        .reduce((accumulator, currentDigit) => accumulator + currentDigit, 0);

    const outcome = (initialValue % totalOfDigits === 0) ? 'Yes' : 'No';

    console.log(outcome);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));