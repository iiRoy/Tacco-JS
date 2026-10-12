'use strict'

function getUniqueSortedNumbers(numberCollection) {
    const distinctValues = numberCollection.filter((currentValue, currentIndex, arrayReference) => {
        return arrayReference.indexOf(currentValue) === currentIndex;
    });

    distinctValues.sort((firstElement, secondElement) => firstElement - secondElement);

    return distinctValues;
}

function processInput(rawData) {
    const linesArray = rawData.split(/\n/);

    // The first line, representing 'n' in the original, is not utilized in the subsequent logic.
    // Therefore, it can be safely omitted without altering observable behavior.
    // const initialCount = Number(linesArray[0]);

    const rawValuesString = linesArray[1];
    const stringTokens = rawValuesString.split(' ');
    const parsedNumbers = stringTokens.map(val => Number(val));

    const uniqueSortedLocations = getUniqueSortedNumbers(parsedNumbers);

    const maxLocation = uniqueSortedLocations[uniqueSortedLocations.length - 1];
    const minLocation = uniqueSortedLocations[0];
    const resultRange = maxLocation - minLocation;

    console.log(resultRange);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
