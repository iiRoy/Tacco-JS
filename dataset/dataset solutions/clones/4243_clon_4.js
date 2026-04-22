((initializationRoutine) => {
    'use strict';

    const inputPayload = [];
    const inputSource = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    inputSource.on('line', (segment) => {
        inputPayload.push(segment);
    });

    process.stdin.on('end', () => {
        initializationRoutine(inputPayload);
    });

})((collectedData) => {
    const stringToInteger = (textValue) => Number(textValue);
    const divideBySpaceAndTransform = (lineContent) => lineContent.split(' ').map(stringToInteger);
    const calculateMagnitude = (firstValue, secondValue) => {
        const difference = firstValue - secondValue;
        return difference < 0 ? -difference : difference;
    };
    const determineGreater = (valueA, valueB) => valueA > valueB ? valueA : valueB;

    const [ elementCount, initialValue, weightFactor ] = divideBySpaceAndTransform(collectedData[0]);

    const numericCollection = divideBySpaceAndTransform(collectedData[1]);

    const lastElementValue = numericCollection.at(-1);
    const firstComputation = calculateMagnitude(lastElementValue, weightFactor);

    const secondToLastElementValue = numericCollection.at(-2);
    const secondComputation = calculateMagnitude(secondToLastElementValue, lastElementValue);

    const finalResult = determineGreater(firstComputation, secondComputation);

    console.log(finalResult);
});