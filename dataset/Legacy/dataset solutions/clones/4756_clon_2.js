let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input string is split by spaces to create an array of string-represented numbers.
let numericStrings = rawData.split(' ');

// Individual values are extracted from the array.
let firstVal = numericStrings[0];
let secondVal = numericStrings[1];
let thirdVal = numericStrings[2];
let fourthVal = numericStrings[3];

// Calculate the product of the first two numbers and the product of the last two numbers.
// Then, determine which of these two products is greater.
let finalOutcome = (firstVal * secondVal > thirdVal * fourthVal)
    ? firstVal * secondVal
    : thirdVal * fourthVal;

// The larger product is printed to the standard output.
console.log(finalOutcome);
