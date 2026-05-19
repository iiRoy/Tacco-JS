'use strict';

function processEncryptedMessage(encryptedInput) {
    const alphabetStartCode = 65;
    const alphabetLength = 26;
    const decryptionShift = 3;

    return encryptedInput
        .split('')
        .map(char => {
            const currentCode = char.charCodeAt(0);
            const zeroBasedIndex = currentCode - alphabetStartCode;
            const shiftedZeroBased = (zeroBasedIndex - decryptionShift + alphabetLength) % alphabetLength;
            const newCode = shiftedZeroBased + alphabetStartCode;
            return String.fromCharCode(newCode);
        })
        .join('');
}

const inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

inputHandler.on('line', (receivedLine) => {
    console.log(processEncryptedMessage(receivedLine.trim()));
    inputHandler.close();
});
