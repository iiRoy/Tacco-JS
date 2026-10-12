const fileSystemModule = require('fs');

const inputDataBuffer = fileSystemModule.readFileSync('/dev/stdin');

const ASCII_UPPERCASE_A_CODE = 65;
const ASCII_UPPERCASE_Z_CODE = 90;
const ASCII_LOWERCASE_A_CODE = 97;
const ASCII_LOWERCASE_Z_CODE = 122;

const CASE_TRANSFORMATION_OFFSET = ASCII_LOWERCASE_A_CODE - ASCII_UPPERCASE_A_CODE;

function getCaseSwappedByte(originalByteValue) {
    if (originalByteValue >= ASCII_UPPERCASE_A_CODE && originalByteValue <= ASCII_UPPERCASE_Z_CODE) {
        // It's an uppercase letter, convert to lowercase
        return originalByteValue + CASE_TRANSFORMATION_OFFSET;
    } else if (originalByteValue >= ASCII_LOWERCASE_A_CODE && originalByteValue <= ASCII_LOWERCASE_Z_CODE) {
        // It's a lowercase letter, convert to uppercase
        return originalByteValue - CASE_TRANSFORMATION_OFFSET;
    } else {
        // Not an ASCII letter that needs case swapping, return as is
        return originalByteValue;
    }
}

for (let bufferIndex = 0; bufferIndex < inputDataBuffer.length; bufferIndex++) {
    const byteAtCurrentPosition = inputDataBuffer[bufferIndex];
    const modifiedByteValue = getCaseSwappedByte(byteAtCurrentPosition);
    inputDataBuffer[bufferIndex] = modifiedByteValue;
}

console.log(inputDataBuffer.toString().trim());
