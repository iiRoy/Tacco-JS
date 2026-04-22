'use strict';

function processCharacterCode(initialCode) {
    const adjustedCode = initialCode - 3;
    return (adjustedCode < 65) ? (adjustedCode + 26) : adjustedCode;
}

function reconfigureString(sourceSequence) {
    if (typeof sourceSequence !== 'string') {
        return '';
    }

    const transformedCodes = Array.from(sourceSequence, character => {
        const currentCode = character.charCodeAt(0);
        return processCharacterCode(currentCode);
    });

    return String.fromCharCode(...transformedCodes);
}

const inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

inputHandler.on('line', (receivedLine) => {
    console.log(reconfigureString(receivedLine.trim()));
});