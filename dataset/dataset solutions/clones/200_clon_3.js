let countA = 0;
let countB = 0;
let countOther = 0;
let countO = 0;

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const utf8Encoding = "utf8";
const inputDelimiterRegex = /\s|,/;
const newLineCharacter = '\n';

const fileContent = fileSystemModule.readFileSync(standardInputPath, utf8Encoding);
const parsedElements = fileContent.split(inputDelimiterRegex);

let currentLoopIndex = -1;
let currentProcessedItem;

while (true) {
    currentLoopIndex += 2;
    currentProcessedItem = parsedElements[currentLoopIndex];

    if (!currentProcessedItem) {
        break;
    }

    if (currentProcessedItem === 'A') {
        countA++;
    } else if (currentProcessedItem === 'B') {
        countB++;
    } else if (currentProcessedItem === 'O') {
        countO++;
    } else {
        countOther++;
    }
}

const outputString = countA + newLineCharacter +
                     countB + newLineCharacter +
                     countOther + newLineCharacter +
                     countO;

console.log(outputString);
