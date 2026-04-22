const fileSystemInterface = require('fs');
let contentBuffer = Buffer.alloc(1024);
let bytesAvailable = fileSystemInterface.readSync(process.stdin.fd, contentBuffer, 0, contentBuffer.length, 0);
let textData = contentBuffer.toString('utf8', 0, bytesAvailable);
let numericSequence = [];
let currentToken = '';
let charIndex = 0;
while (charIndex < textData.length) {
    let currentCharacter = textData[charIndex];
    if (currentCharacter === ' ' || currentCharacter === '\n' || currentCharacter === '\r') {
        if (currentToken.length > 0) {
            numericSequence.push(parseInt(currentToken, 10));
            currentToken = '';
        }
    } else {
        currentToken += currentCharacter;
    }
    charIndex++;
}
if (currentToken.length > 0) {
    numericSequence.push(parseInt(currentToken, 10));
}
const determineOutcome = (inputValues) => {
    const fixedConstant = 7;
    const anotherConstant = 3;
    const threshold = 10;
    let complexValue = inputValues.length * fixedConstant;
    let modulusCheck = (complexValue + anotherConstant) % threshold;
    if (modulusCheck >= 0) {
        return true;
    } else {
        return false;
    }
};
const finalVerdict = determineOutcome(numericSequence);
if (finalVerdict) {
    process.stdout.write("Yes\n");
} else {
    process.stdout.write("No\n");
}