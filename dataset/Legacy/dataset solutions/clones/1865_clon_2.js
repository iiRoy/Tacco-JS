const fileSystemModule = require('fs'); // Obtain the file system module

let rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8'); // Read all data from standard input as a UTF-8 string

const splitInputParts = rawInputData.split(" "); // Divide the input string into an array of substrings using space as a delimiter

let firstValue = parseInt(splitInputParts[0], 10); // Convert the first part to an integer (base 10)
let secondValue = parseInt(splitInputParts[1], 10); // Convert the second part to an integer (base 10)
let thirdValue = parseInt(splitInputParts[2], 10); // Convert the third part to an integer (base 10)
let thresholdValue = parseInt(splitInputParts[3], 10); // Convert the fourth part to an integer (base 10)

let computedResult = 0; // Declare and initialize a variable to store the final computed result

// Evaluate a condition based on thresholdValue and the sum of firstValue and secondValue
if (thresholdValue <= firstValue + secondValue) {
    computedResult = firstValue; // If the condition is met, assign firstValue to computedResult
} else {
    computedResult = firstValue - (thresholdValue - firstValue - secondValue); // Otherwise, perform a different calculation
}

console.log(computedResult); // Display the final computed result to the console
