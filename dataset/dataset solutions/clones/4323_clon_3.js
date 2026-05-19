'use strict';

const convertToNumber = (strValue) => Number(strValue);

function processInputData(rawDataString) {
    let cleanedInputString = rawDataString.trim();
    let stringPartsArray = cleanedInputString.split(/\s+/);
    let numericalValuesArray = stringPartsArray.map(convertToNumber);

    let initialCountValue = numericalValuesArray.shift(); // Corresponds to original N, extracted but not used further
    let firstCollection = []; // Corresponds to original A
    let secondCollection = []; // Corresponds to original B

    let poppedSecondElement;
    let poppedFirstElement;

    while (numericalValuesArray.length > 0) {
        poppedSecondElement = numericalValuesArray.pop(); // Get the last element for secondCollection
        poppedFirstElement = numericalValuesArray.pop();  // Get the second-to-last element for firstCollection
        
        firstCollection.push(poppedFirstElement);
        secondCollection.push(poppedSecondElement);
    }

    let maximumValueInFirstCollection = Math.max(...firstCollection);

    let indexOfMaximum = firstCollection.indexOf(maximumValueInFirstCollection);
    let correspondingValueInSecondCollection = secondCollection[indexOfMaximum];

    console.log(maximumValueInFirstCollection + correspondingValueInSecondCollection);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
