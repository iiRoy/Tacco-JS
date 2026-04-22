'use strict';

const charTransformLookup = new Array(256);

for (let currentCodeValue = 0; currentCodeValue < 256; currentCodeValue++) {
    let shiftedCodeValue = currentCodeValue - 3;
    if (shiftedCodeValue < 65) {
        shiftedCodeValue += 26;
    }
    charTransformLookup[currentCodeValue] = String.fromCharCode(shiftedCodeValue);
}

function processMessage(sourceText) {
    const characterArray = sourceText.split('');
    const transformedArray = characterArray.map(singleChar => {
        return charTransformLookup[singleChar.charCodeAt(0)];
    });
    return transformedArray.join('');
}

const consoleInputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

consoleInputHandler.on('line', (dataLine) => {
    console.log(processMessage(dataLine.trim()));
    consoleInputHandler.close();
});