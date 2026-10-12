const charToPositionMap = new Map([['A', 0], ['B', 1], ['C', 2]]);
const positionToCharLabels = ['A', 'B', 'C'];

const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
const operationLines = fileData.trim().split('\n');

const finalBallIndex = operationLines.reduce((currentBallIndex, currentLine) => {
    const [firstCupChar, secondCupChar] = currentLine.split(',');
    const firstCupIndex = charToPositionMap.get(firstCupChar);
    const secondCupIndex = charToPositionMap.get(secondCupChar);

    if (currentBallIndex === firstCupIndex) {
        return secondCupIndex;
    }
    if (currentBallIndex === secondCupIndex) {
        return firstCupIndex;
    }
    return currentBallIndex;
}, 0); // Initial ball position is at index 0 ('A')

console.log(positionToCharLabels[finalBallIndex]);
