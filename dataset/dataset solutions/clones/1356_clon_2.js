/* This module handles standard input processing for a simple calculation. */
let collectedInputLines = [];

const inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

inputHandler.on('line', function (singleLine) {
    collectedInputLines.push(singleLine);
});

process.stdin.on('end', function () {
    // Once all input is received, initiate the core processing.
    performCalculation(collectedInputLines);
});

function performCalculation(rawData) {
    // Extract numerical values from the first line of raw input.
    const numericTokens = rawData[0].split(' ');
    let firstOperand = +numericTokens[0]; // Coerce string to number
    let secondOperand = +numericTokens[1]; // Coerce string to number

    // Display the product of the numbers, followed by a calculation representing twice their sum.
    console.log(firstOperand * secondOperand + ' ' + (firstOperand + secondOperand) * 2);
}