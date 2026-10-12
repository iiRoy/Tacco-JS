'use strict';

function processInputAndCalculate(rawData) {
    const numericComponents = rawData.trim().split(/\s+/).map(Number);

    const [firstValue, secondValue, thirdValue] = numericComponents;

    const allInputValues = [firstValue, secondValue, thirdValue];

    const containsEvenNumber = allInputValues.some(currentNumber => (currentNumber % 2) === 0);

    if (containsEvenNumber) {
        console.log(0);
        return;
    }

    const sortedValues = [...allInputValues].sort((valA, valB) => valA - valB);

    const productOfSmallestTwo = sortedValues[0] * sortedValues[1];

    console.log(productOfSmallestTwo);
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
