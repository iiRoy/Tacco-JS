'use strict';

function calculateProductOfDecremented(valueOne, valueTwo) {
    const decrementedValueOne = valueOne - 1;
    const decrementedValueTwo = valueTwo - 1;
    const productResult = decrementedValueOne * decrementedValueTwo;
    return productResult;
}

function processInputData(inputStringData) {
    const delimiter = " ";
    const stringComponents = inputStringData.split(delimiter);

    const numericValuesArray = stringComponents.map(singleString => {
        const convertedNumber = Number(singleString);
        return convertedNumber;
    });

    const firstNumericElement = numericValuesArray[0];
    const secondNumericElement = numericValuesArray[1];

    const finalCalculatedOutput = calculateProductOfDecremented(firstNumericElement, secondNumericElement);

    console.log(finalCalculatedOutput);
}

const fileSystemUtility = require("fs");
const standardInputSource = "/dev/stdin";
const textEncoding = "utf8";

const rawContentFromStdin = fileSystemUtility.readFileSync(standardInputSource, textEncoding);

processInputData(rawContentFromStdin);
