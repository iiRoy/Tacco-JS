const fileSystem = require('fs');
let inputRawLines;
try {
    inputRawLines = fileSystem.readFileSync('/dev/stdin', 'utf-8').split('\n');
} catch (readError) {
    inputRawLines = [];
}

function performCountingSort(sourceCollection) {
    if (!sourceCollection || sourceCollection.length === 0) {
        return [];
    }

    let maximumValue = -1;
    const collectionLength = sourceCollection.length;
    let currentIdx = 0;
    while (currentIdx < collectionLength) {
        const valueToCheck = sourceCollection[currentIdx];
        if (typeof valueToCheck === 'number' && Number.isInteger(valueToCheck) && valueToCheck >= 0) {
            if (valueToCheck > maximumValue) {
                maximumValue = valueToCheck;
            }
        }
        currentIdx++;
    }

    let frequencyMap = new Array(maximumValue + 1).fill(0);
    let orderedElements = new Array(collectionLength);

    sourceCollection.forEach(itemValue => {
        if (typeof itemValue === 'number' && Number.isInteger(itemValue) && itemValue >= 0 && itemValue <= maximumValue) {
            frequencyMap[itemValue]++;
        }
    });

    let mapIndex = 1;
    while (mapIndex <= maximumValue) {
        const previousAccumulatedCount = frequencyMap[mapIndex - 1];
        frequencyMap[mapIndex] += previousAccumulatedCount;
        mapIndex++;
    }

    let reverseIterationIndex = collectionLength - 1;
    while (reverseIterationIndex >= 0) {
        const elementToPlace = sourceCollection[reverseIterationIndex];

        if (typeof elementToPlace === 'number' && Number.isInteger(elementToPlace) && elementToPlace >= 0 && elementToPlace <= maximumValue) {
            let finalPosition = frequencyMap[elementToPlace] - 1;

            if (finalPosition >= 0 && finalPosition < collectionLength) {
                orderedElements[finalPosition] = elementToPlace;
            }
            frequencyMap[elementToPlace]--;
        }
        reverseIterationIndex--;
    }

    return orderedElements;
}

const parseNumericSequence = (textSequence) => {
    if (!textSequence || textSequence.trim() === '') {
        return [];
    }
    return textSequence.split(' ').map(elementString => {
        const parsedNumber = Number(elementString);
        if (isNaN(parsedNumber)) {
            return null;
        }
        return parsedNumber;
    }).filter(num => num !== null);
};

let rawDataLine = '';
if (inputRawLines.length > 1) {
    rawDataLine = inputRawLines[1];
}

let numericValues = parseNumericSequence(rawDataLine);

if (numericValues.length === 0) {
    console.log("");
} else {
    const finalSortedResult = performCountingSort(numericValues);
    let outputString = finalSortedResult.join(' ');
    console.log(outputString);
}