var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

var parsedValues = rawData.split(/ |\n/);

var totalElements = parseInt(parsedValues[0]);
var validPairs = 0;
var iterationCounter = 0;

for (let outerIndex = 1; outerIndex < totalElements + 1; outerIndex++) {
  for (let innerIndex = 1; innerIndex < outerIndex; innerIndex++) {
    // Increment a counter for each pair evaluation.
    iterationCounter++;

    // Obtain string representations of the current numbers for decimal checking.
    let strValA = parsedValues[innerIndex].toString();
    let strValB = parsedValues[outerIndex].toString();

    // Case 1: Both numbers are integers (no decimal point).
    if (strValA.indexOf('.') === -1 && strValB.indexOf('.') === -1) {
      validPairs += 1; // Their product will always be an integer.
    }
    // Case 2: The first number is a decimal, the second is an integer.
    else if (strValA.indexOf('.') > -1 && strValB.indexOf('.') === -1) {
      // Determine the number of decimal places in the first number.
      let decimalPlaces = strValA.length - strValA.indexOf('.') - 1;
      // Check if the product of the fractional part of the first number and the second number
      // results in a value that, when considering its last 'decimalPlaces' digits, is zero.
      // This effectively checks if the product is an integer.
      if (parseInt((parseInt(strValA.split('.')[1]) * parsedValues[outerIndex]).toString().substr(-decimalPlaces)) === 0) {
        validPairs += 1;
      }
    }
    // Case 3: The second number is a decimal, the first is an integer.
    else if (strValB.indexOf('.') > -1 && strValA.indexOf('.') === -1) {
      // Determine the number of decimal places in the second number.
      let decimalPlaces = strValB.length - strValB.indexOf('.') - 1;
      // Similar check as Case 2, but with the roles of the numbers reversed.
      if (parseInt((parseInt(strValB.split('.')[1]) * parsedValues[innerIndex]).toString().substr(-decimalPlaces)) === 0) {
        validPairs += 1;
      }
    }
    // Other cases (e.g., both are decimals) are not counted.
  }
}

// Output the final tally of pairs whose product is an integer.
console.log(validPairs);
