'use strict';

const transformString = (inputMessage) => {
    return Array.from(inputMessage).map(individualChar => {
        const numericValue = individualChar.charCodeAt(0);
        let transformedValue;

        // Check if the character's ASCII value falls within the range for uppercase English letters (A-Z)
        if (numericValue >= 0x41 && numericValue <= 0x5A) {
            // Apply the decryption shift for uppercase letters, ensuring wrap-around
            // 0x41 is ASCII for 'A', 0x5A is ASCII for 'Z'
            transformedValue = ((numericValue - 0x41 - 3 + 26) % 26) + 0x41;
        } else {
            // For any other character, apply a simple subtraction of 3 from its ASCII value
            transformedValue = numericValue - 3;
        }
        return String.fromCharCode(transformedValue);
    }).join('');
};

const ioInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

ioInterface.on('line', (dataInput) => {
    const cleanedInput = dataInput.trim();
    console.log(transformString(cleanedInput));
});