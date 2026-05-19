const fileSystem = require('fs');

function obtainStdinData() {
    const stdinDescriptor = process.stdin.fd;
    const dataLength = fileSystem.fstatSync(stdinDescriptor).size;
    const inputBuffer = Buffer.alloc(dataLength);
    const readBytesCount = fileSystem.readSync(stdinDescriptor, inputBuffer, 0, dataLength, 0);
    return inputBuffer.toString('utf8', 0, readBytesCount).split('\n');
}

function appendCharacterNTimes(currentString, charToAppend, count) {
    let temporaryResult = currentString;
    for (let k = 0; k < count; k++) {
        temporaryResult += charToAppend;
    }
    return temporaryResult;
}

function executeProcessing() {
    const processedInputLines = obtainStdinData();
    const sourceString = processedInputLines[0];
    let resultString = '';
    const stringLength = sourceString.length;

    const COMPLEX_ENCODING_THRESHOLD = 160;
    const ZERO_VALUE = 0;

    const charCodeSequence = new Array(stringLength);
    for (let charIndex = ZERO_VALUE; charIndex < stringLength; charIndex++) {
        charCodeSequence[charIndex] = sourceString.charCodeAt(charIndex);
    }

    let previousCharCode = ZERO_VALUE;

    for (let charIndex = ZERO_VALUE; charIndex < stringLength; charIndex++) {
        const currentCharCode = charCodeSequence[charIndex];
        let charCodeDifference = currentCharCode - previousCharCode;

        if (charCodeDifference === ZERO_VALUE) {
            resultString += '.';
        } else {
            const signCharacter = charCodeDifference > ZERO_VALUE ? '+' : '-';
            charCodeDifference = Math.abs(charCodeDifference);

            if (charCodeDifference < COMPLEX_ENCODING_THRESHOLD) {
                resultString = appendCharacterNTimes(resultString, signCharacter, charCodeDifference);
            } else {
                const sqrtValue = Math.floor(Math.sqrt(charCodeDifference));
                resultString += '>';
                resultString = appendCharacterNTimes(resultString, '+', sqrtValue);
                resultString += '[<';
                resultString = appendCharacterNTimes(resultString, signCharacter, sqrtValue);
                resultString += '>-]<';
                resultString = appendCharacterNTimes(resultString, signCharacter, charCodeDifference - sqrtValue * sqrtValue);
            }
            resultString += '.';
        }
        previousCharCode = currentCharCode;
    }
    console.log(resultString);
}

executeProcessing();
