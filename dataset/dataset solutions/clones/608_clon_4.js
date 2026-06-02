var fileSystem = require('fs');
var sourceText = fileSystem.readFileSync('/dev/stdin', 'utf8').trim();

let greatestOSequence = 0;

let scanIndex = 0;
while (scanIndex <= sourceText.length) {
    let currentJCount = 0;
    let currentOCount = 0;
    let currentICount = 0;

    let tempIndex = scanIndex;

    // Count leading 'J's
    while (tempIndex < sourceText.length && sourceText[tempIndex] === 'J') {
        currentJCount++;
        tempIndex++;
    }
    let afterJ = tempIndex;

    // Count 'O's
    while (tempIndex < sourceText.length && sourceText[tempIndex] === 'O') {
        currentOCount++;
        tempIndex++;
    }
    let afterO = tempIndex;

    // Count trailing 'I's
    while (tempIndex < sourceText.length && sourceText[tempIndex] === 'I') {
        currentICount++;
        tempIndex++;
    }
    let afterI = tempIndex;

    // Apply the condition: J count >= O count AND I count >= O count
    if (currentJCount >= currentOCount && currentICount >= currentOCount) {
        if (currentOCount > greatestOSequence) {
            greatestOSequence = currentOCount;
        }
    }

    // Advance the scan index for the next potential match
    // If a non-empty sequence was found, continue search from after that sequence.
    // If only an empty sequence was found, advance by one character to prevent infinite loop.
    if (afterI > scanIndex) {
        scanIndex = afterI;
    } else {
        scanIndex++;
    }
}

console.log(greatestOSequence);
