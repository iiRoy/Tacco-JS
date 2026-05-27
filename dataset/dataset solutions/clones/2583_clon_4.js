const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const [firstLineContent, secondLineContent] = rawData.split('\n', 2);

const firstLineParts = firstLineContent.split(' ');
const totalElements = Number(firstLineParts[0]);
const thresholdValue = Number(firstLineParts[1]);

const targetString = secondLineContent;

const characterChangeCount = Array.from(targetString).reduce((accumulator, currentCharacter, currentIndex, charArray) => {
    if (currentIndex > 0 && currentCharacter !== charArray[currentIndex - 1]) {
        return accumulator + 1;
    }
    return accumulator;
}, 0);

const potentialReduction = characterChangeCount - (2 * thresholdValue);
const actualReduction = Math.max(0, potentialReduction);

console.log(totalElements - 1 - actualReduction);
