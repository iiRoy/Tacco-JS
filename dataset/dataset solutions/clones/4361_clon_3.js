"use strict";

const processInput = (inputData) => {
    const firstLine = inputData.split("\n")[0];

    const targetCharacter = '9';

    const charactersInLine = firstLine.split("");

    const foundTargetCharacters = charactersInLine.filter(charElement => charElement === targetCharacter);

    const hasTargetCharacter = foundTargetCharacters.length > 0;

    const finalOutput = hasTargetCharacter ? "Yes" : "No";

    console.log(finalOutput);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
