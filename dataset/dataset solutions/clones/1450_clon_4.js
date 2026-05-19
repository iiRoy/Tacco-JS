const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const allLines = fileContent.split('\n');

const [
    firstInputLine,
    secondInputLine,
    thirdInputLine,
    fourthInputLine,
    ...remainingInputLines
] = allLines;

const sourceCollection = secondInputLine.split(' ');
const targetCollectionUnique = new Set(fourthInputLine.split(' '));

const sourceSetForLookup = new Set(sourceCollection);

const intersectionCount = Array.from(targetCollectionUnique).reduce((accumulator, currentItem) => {
    return accumulator + (sourceSetForLookup.has(currentItem) ? 1 : 0);
}, 0);

console.log(intersectionCount);
