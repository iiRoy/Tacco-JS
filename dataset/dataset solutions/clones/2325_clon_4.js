"use strict";
process.stdin.resume();
process.stdin.setEncoding("utf-8");

function print(x) {
  console.log(x);
}

let inputString = "";
let currentLine = 0;

process.stdin.on("data", inputStdin => {
  inputString += inputStdin;
});
process.stdin.on("end", () => {
  inputString = inputString.split("\n");
  main();
});
function readline() {
  return inputString[currentLine++];
}

// ************************ Ignore above this Line ******************************
// **************************** Main Code Start *********************************

// Custom function for integer division (equivalent to Math.floor(dividend / divisor) for positive integers)
// Implemented using repeated subtraction to provide a different strategy.
function calculateIntegerQuotient(dividend, divisor) {
    if (divisor === 0) {
        // In the original code, if Min is 0:
        // div = Math.floor(Max / 0) which is Infinity.
        // mul = Math.floor(Max * 0) which is 0.
        // ok = Math.floor(mul / div) which is Math.floor(0 / Infinity) = 0.
        // To replicate this, if this function is called with divisor 0 for the first division (Max/Min),
        // it should return Infinity. Then, when called for the final division (mul/div),
        // calculateIntegerQuotient(0, Infinity) will correctly return 0.
        return Infinity;
    }
    let quotientCount = 0;
    let currentRemainder = dividend;
    while (currentRemainder >= divisor) {
        currentRemainder -= divisor;
        quotientCount++;
    }
    return quotientCount;
}

// Custom function for integer multiplication (equivalent to factorOne * factorTwo)
// Implemented using repeated addition to provide a different strategy.
function calculateIntegerProduct(factorOne, factorTwo) {
    let accumulatedSum = 0;
    for (let i = 0; i < factorTwo; i++) {
        accumulatedSum += factorOne;
    }
    return accumulatedSum;
}

function processInputAndCompute() {
    let numberStrings = readline().split(" ");
    let firstValue = parseInt(numberStrings[0]);
    let secondValue = parseInt(numberStrings[1]);

    let greaterValue;
    let lesserValue;

    // Determine the greater and lesser values without using Math.max/Math.min
    if (firstValue > secondValue) {
        greaterValue = firstValue;
        lesserValue = secondValue;
    } else {
        greaterValue = secondValue;
        lesserValue = firstValue;
    }

    // Handle the specific case where the lesser value is zero.
    // As per original code's behavior: Max=X, Min=0 -> div=Infinity, mul=0, ok=floor(0/Infinity)=0.
    if (lesserValue === 0) {
        print(0);
        return;
    }

    // Perform the intermediate calculations using custom functions
    let intermediateDivisorResult = calculateIntegerQuotient(greaterValue, lesserValue);
    let intermediateProductResult = calculateIntegerProduct(greaterValue, lesserValue);

    // Perform the final calculation using the custom integer division
    let finalCalculationOutcome = calculateIntegerQuotient(intermediateProductResult, intermediateDivisorResult);

    print(finalCalculationOutcome);
}

function main() {
  processInputAndCompute();
}
