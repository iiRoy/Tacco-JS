const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const extractedStrings = fileContent.match(/-?\d+/g) || [];

let orderedStringSequence = [];
for (let currentString of extractedStrings) {
    let insertionMade = false;
    for (let idx = 0; idx < orderedStringSequence.length; idx++) {
        if (currentString < orderedStringSequence[idx]) {
            orderedStringSequence.splice(idx, 0, currentString);
            insertionMade = true;
            break;
        }
    }
    if (!insertionMade) {
        orderedStringSequence.push(currentString);
    }
}

const finalFormattedOutput = orderedStringSequence.join(' ');
console.log(finalFormattedOutput);
