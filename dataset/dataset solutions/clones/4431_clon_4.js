'use strict';

function processInput(rawText) {
    let currentLineContent = '';
    let newlineEncountered = false;
    for (let i = 0; i < rawText.length; i++) {
        if (rawText[i] === '\n') {
            newlineEncountered = true;
            break;
        }
        currentLineContent += rawText[i];
    }
    if (!newlineEncountered && rawText.length > 0) {
        currentLineContent = rawText;
    }

    const numericStrings = [];
    let digitSequence = '';
    for (let j = 0; j < currentLineContent.length; j++) {
        const character = currentLineContent[j];
        if (character >= '0' && character <= '9') {
            digitSequence += character;
        } else {
            if (digitSequence.length > 0) {
                numericStrings.push(digitSequence);
                digitSequence = '';
            }
        }
    }
    if (digitSequence.length > 0) {
        numericStrings.push(digitSequence);
    }

    let firstOperand = Number(numericStrings[0]);
    let secondOperand = Number(numericStrings[1]);

    const finalResult = firstOperand * secondOperand - firstOperand - secondOperand + 1;

    console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
