"use strict";

const parseInputValues = (rawInputString) => {
    const trimmedContent = rawInputString.trim();
    const stringSegments = trimmedContent.split(' ');
    // Explicitly providing radix 10 for parseInt for robustness
    return stringSegments.map(segment => parseInt(segment, 10));
};

const processCalculation = (inputData) => {
    const [firstNum, secondNum, thirdNum, fourthNum] = inputData;

    // Introduce temporary constants for each product
    const productOneThree = firstNum * thirdNum;
    const productOneFour = firstNum * fourthNum;
    const productTwoThree = secondNum * thirdNum;
    const productTwoFour = secondNum * fourthNum;

    // Use Math.max to find the greatest product, replacing sequential if statements
    const greatestResult = Math.max(productOneThree, productOneFour, productTwoThree, productTwoFour);

    // Ensure the output is a string, matching original behavior
    console.log(greatestResult.toString());
};

// Read the input and pass it to the processing function
const rawFileData = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericalValues = parseInputValues(rawFileData);
processCalculation(numericalValues);
