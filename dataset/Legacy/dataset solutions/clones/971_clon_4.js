const fileSystem = require('fs');
const rawContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const contentLines = rawContent.trim().split('\n');
const primaryText = contentLines[0];
const patternText = contentLines[1];

const potentialStarts = Array.from({ length: primaryText.length }, (_, k) => k);

const foundPositions = potentialStarts.reduce((accumulator, currentPosition) => {
    if (primaryText.substring(currentPosition, currentPosition + patternText.length) === patternText) {
        accumulator.push(currentPosition);
    }
    return accumulator;
}, []);

foundPositions.forEach(position => console.log(position));
