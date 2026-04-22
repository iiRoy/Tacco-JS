const sourceDataLines = require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .split(/\n/);
let totalElements = Number(sourceDataLines[0]);
let numericSequence = sourceDataLines[1]
    .split(' ')
    .map(Number);
let currentMinimumIndex = 0;
let exchangeOperations = 0;
let temporaryHolder;
function arrangeElementsAscending(targetArray, arrayLength) {
    for (let primaryIterator = 0; primaryIterator <= arrayLength - 1; primaryIterator++) {
        currentMinimumIndex = primaryIterator;
        for (let secondaryIterator = primaryIterator; secondaryIterator <= arrayLength - 1; secondaryIterator++) {
            if (targetArray[secondaryIterator] < targetArray[currentMinimumIndex]) {
                currentMinimumIndex = secondaryIterator;
            }
        }
        if (targetArray[primaryIterator] != targetArray[currentMinimumIndex]) {
            temporaryHolder = targetArray[primaryIterator];
            targetArray[primaryIterator] = targetArray[currentMinimumIndex];
            targetArray[currentMinimumIndex] = temporaryHolder;
            exchangeOperations++;
        }
    }
}
arrangeElementsAscending(numericSequence, totalElements);
console.log(numericSequence.join(' '));
console.log(exchangeOperations);