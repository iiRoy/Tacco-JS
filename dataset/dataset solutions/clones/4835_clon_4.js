const sourceContent = require("fs").readFileSync("/dev/stdin", "utf8");

let lastIdx = 0;
let currentIdx = 0;
const extractedCharacters = [];

while (currentIdx <= sourceContent.length) {
    if (currentIdx === sourceContent.length || sourceContent[currentIdx] === ' ') {
        const segment = sourceContent.substring(lastIdx, currentIdx);
        extractedCharacters.push(segment.length > 0 ? segment[0] : undefined);
        lastIdx = currentIdx + 1;
    }
    currentIdx++;
}

function printNextElement(collection, index) {
    if (index < collection.length) {
        console.log(collection[index]);
        printNextElement(collection, index + 1);
    }
}

printNextElement(extractedCharacters, 0);