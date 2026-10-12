const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = sourceContent.trim().split("\n");

const totalCases = parseInt(inputLines.shift(), 10);

Array.from({ length: totalCases }).forEach(() => {
    const [elementCount, selectionCount] = inputLines.shift().split(' ').map(Number);
    const numericSequence = inputLines.shift().split(' ').map(Number);

    const totalSpan = numericSequence[numericSequence.length - 1] - numericSequence[0];

    const segmentDifferences = numericSequence.slice(1).map((currentValue, index) => {
        return currentValue - numericSequence[index];
    });

    segmentDifferences.sort((firstElement, secondElement) => secondElement - firstElement);

    const excludedSum = segmentDifferences
        .slice(0, Math.min(selectionCount - 1, segmentDifferences.length))
        .reduce((accumulator, currentDifference) => accumulator + currentDifference, 0);

    console.log(totalSpan - excludedSum);
});
