'use strict';

function processInput(targetCountStr) {
    const targetCount = Number(targetCountStr);
    const maxSafeValue = Number.MAX_SAFE_INTEGER;
    const scaleFactor = 10 ** 6; // Using exponentiation as hinted in original comment

    const initialSequenceElements = [2, 1];
    let sequenceValues = [...initialSequenceElements]; // Use spread to create a new array

    let calculatedValue; // Declared outside the loop to be accessible later for final check

    // Helper function to encapsulate the conditional push logic
    const appendToSequence = (valueToAdd) => {
        if (valueToAdd <= maxSafeValue) {
            sequenceValues.push(valueToAdd);
        } else {
            sequenceValues.push(valueToAdd / scaleFactor);
        }
    };

    for (let index = initialSequenceElements.length; index <= targetCount; index++) {
        const previousSecond = sequenceValues[index - 2];
        const previousFirst = sequenceValues[index - 1];
        calculatedValue = previousSecond + previousFirst; // Assign to outer scope variable

        appendToSequence(calculatedValue); // Use the helper function
    }

    // Retrieve the last element before the final conditional output
    const finalOutputValue = sequenceValues.pop();

    if (calculatedValue <= maxSafeValue) { // This `calculatedValue` is from the last iteration of the loop
        console.log(finalOutputValue);
    } else {
        console.log(finalOutputValue * scaleFactor);
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
