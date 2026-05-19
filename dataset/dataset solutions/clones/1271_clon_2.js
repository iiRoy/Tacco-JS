const fileSystemModule = require('fs'); // Import the file system module
let numericInput = fileSystemModule.readFileSync('/dev/stdin', 'utf8'); // Read raw data from standard input

// Process the input: remove leading/trailing whitespace and convert to a number
numericInput = (numericInput.trim()) - 0;

let outputAccumulator = ""; // Initialize an empty string to build the result

// Loop through numbers starting from 3 up to the parsed input value
for (let currentNumber = 3; currentNumber <= numericInput; currentNumber++) {
    // Condition 1: If the current number is perfectly divisible by 3
    if (currentNumber % 3 === 0) {
        outputAccumulator += currentNumber + " "; // Append the number and a space
    }
    // Condition 2: If the current number is NOT divisible by 3 AND its string representation contains the digit '3'
    if (currentNumber % 3 !== 0 && String(currentNumber).includes('3')) {
        outputAccumulator += currentNumber + " "; // Append the number and a space
    }
}

// Print the final accumulated string, ensuring no trailing whitespace
console.log(outputAccumulator.trim());
