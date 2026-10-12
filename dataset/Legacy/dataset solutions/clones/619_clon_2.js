let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from the standard input stream

const lineSegments = (rawData.trim()).split("\n"); // Process the raw data: remove leading/trailing whitespace and split into an array of lines

let currentValue = lineSegments[0] - 0; // Initialize the primary accumulator with the numeric value of the first line

for (let idx = 1; idx < lineSegments.length; idx = idx + 2) { // Iterate through the array, processing operations and operands
    // The loop increments by 2 because each operation consists of an operator and an operand
    if (lineSegments[idx] === "=") { // Check if the current segment is the termination operator
        break; // If an equals sign is found, stop further calculations
    }

    if (lineSegments[idx] === "+") { // If the operator is addition
        currentValue += (lineSegments[idx + 1] - 0); // Add the numeric value of the next segment to the accumulator
    }

    if (lineSegments[idx] === "-") { // If the operator is subtraction
        currentValue -= (lineSegments[idx + 1] - 0); // Subtract the numeric value of the next segment from the accumulator
    }

    if (lineSegments[idx] === "*") { // If the operator is multiplication
        currentValue *= (lineSegments[idx + 1] - 0); // Multiply the accumulator by the numeric value of the next segment
    }

    if (lineSegments[idx] === "/") { // If the operator is division
        currentValue /= (lineSegments[idx + 1] - 0); // Divide the accumulator by the numeric value of the next segment
    }

    currentValue = currentValue.toFixed(0) - 0; // Round the current value to the nearest integer and convert it back to a number
}

console.log(currentValue); // Display the final computed value to the console
