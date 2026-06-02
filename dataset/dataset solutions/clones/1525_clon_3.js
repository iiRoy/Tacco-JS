"use strict";

function parseSpaceSeparatedNumbers(lineContent) {
    return lineContent.split(" ").map(Number);
}

function processInputData(rawInputString) {
    const cleanedLines = rawInputString.trim().split("\n");

    const numberValuesAsString = cleanedLines[0];
    const [firstOperand, secondOperand, thirdOperand, fourthOperand] = parseSpaceSeparatedNumbers(numberValuesAsString);

    const determineMaximum = function (valueA, valueB) {
        return Math.max(valueA, valueB);
    };

    const productOneThree = firstOperand * thirdOperand;
    const productOneFour = firstOperand * fourthOperand;
    const productTwoThree = secondOperand * thirdOperand;
    const productTwoFour = secondOperand * fourthOperand;

    const allCalculatedProducts = [];
    allCalculatedProducts.push(productOneThree);
    allCalculatedProducts.push(productOneFour);
    allCalculatedProducts.push(productTwoThree);
    allCalculatedProducts.push(productTwoFour);

    const finalMaximumProduct = allCalculatedProducts.reduce(determineMaximum);

    console.log(finalMaximumProduct);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
