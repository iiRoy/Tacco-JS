const readline = require('readline');

const TARGET_CHAR_C = 'C';
const TARGET_CHAR_F = 'F';

const inputReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const evaluateCharacterSequence = (inputString) => {
    let foundCFlag = false;
    let lastCFoundPosition = -1;

    const stringLength = inputString.length;

    for (let currentIdx = 0; currentIdx < stringLength; currentIdx++) {
        const characterAtCurrentIdx = inputString[currentIdx];
        if (characterAtCurrentIdx === TARGET_CHAR_C) {
            foundCFlag = true;
            lastCFoundPosition = currentIdx;
        }
    }

    let foundFAfterCFlag = false;

    const startSearchForF = foundCFlag ? lastCFoundPosition : 0;

    for (let scanIdx = startSearchForF; scanIdx < stringLength; scanIdx++) {
        const scannedCharacter = inputString[scanIdx];
        if (scannedCharacter === TARGET_CHAR_F) {
            foundFAfterCFlag = true;
            break;
        }
    }

    if (foundCFlag === foundFAfterCFlag) {
        console.log("Yes");
    } else {
        console.log("No");
    }
};

inputReader.on('line', (line) => {
    evaluateCharacterSequence(line);
    inputReader.close();
});
