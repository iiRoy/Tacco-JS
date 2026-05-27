const standardInput = process.stdin;
standardInput.resume();
standardInput.setEncoding('utf8');

const inputLines = [];

const createLineReader = () => {
    const readlineModule = require('readline');
    return readlineModule.createInterface({
        input: standardInput,
        output: process.stdout
    });
};

const inputHandler = createLineReader();

inputHandler.on('line', (currentInputLine) => {
    inputLines.push(currentInputLine);
});

function checkCharacterEquality(charA, charB) {
    return charA === charB;
}

inputHandler.on('close', () => {
    "use strict";

    const stringOne = inputLines[0];
    const stringTwo = inputLines[1];

    let totalMatches = 0;
    const COMPARISON_LIMIT = 3;

    for (let loopIndex = 0; loopIndex < COMPARISON_LIMIT; loopIndex++) {
        if (checkCharacterEquality(stringOne[loopIndex], stringTwo[loopIndex])) {
            totalMatches++;
        }
    }

    console.log(totalMatches);
});
