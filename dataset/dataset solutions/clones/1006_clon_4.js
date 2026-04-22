const fileSystemHandler = require('fs');
const contentBuffer = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');
const textFragments = contentBuffer.split('\n');

const sequenceLength = Number(textFragments[0]);
const valueContainer = textFragments[1].split(' ').map(Number);

let exchangeCounter = 0;

function locateMinimumPosition(segment, startMarker, endMarker, currentMinimumLocator) {
    if (startMarker > endMarker) {
        return currentMinimumLocator;
    }
    if (segment[startMarker] < segment[currentMinimumLocator]) {
        currentMinimumLocator = startMarker;
    }
    return locateMinimumPosition(segment, startMarker + 1, endMarker, currentMinimumLocator);
}

function arrangeElementsRecursively(targetArray, currentSortingPosition, sizeOfCollection) {
    if (currentSortingPosition >= sizeOfCollection - 1) {
        return;
    }

    const minimumLocator = locateMinimumPosition(targetArray, currentSortingPosition, sizeOfCollection - 1, currentSortingPosition);

    if (targetArray[currentSortingPosition] !== targetArray[minimumLocator]) {
        const holdingSpot = targetArray[currentSortingPosition];
        targetArray[currentSortingPosition] = targetArray[minimumLocator];
        targetArray[minimumLocator] = holdingSpot;
        exchangeCounter++;
    }

    arrangeElementsRecursively(targetArray, currentSortingPosition + 1, sizeOfCollection);
}

arrangeElementsRecursively(valueContainer, 0, sequenceLength);

console.log(valueContainer.join(' '));
console.log(exchangeCounter);