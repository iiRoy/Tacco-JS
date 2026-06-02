process.stdin.resume();
process.stdin.setEncoding('utf8');
var receivedLines = [];
var inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

inputHandler.on('line', (currentLine) => {
    receivedLines.push(currentLine);
});

inputHandler.on('close', () => {
    "use strict";
    const primaryString = receivedLines[0];
    const secondaryString = receivedLines[1];

    const identicalCharCount = Array.from(primaryString.substring(0, 3)).filter((charElement, charIndex) => {
        return charElement === secondaryString[charIndex];
    }).length;

    console.log(identicalCharCount);
});
