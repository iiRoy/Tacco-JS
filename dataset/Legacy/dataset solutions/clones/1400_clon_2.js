let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from standard input
let lineSegments = rawData.trim().split("\n"); // Process raw data: remove leading/trailing whitespace, then split into an array of individual lines

while (true) { // Begin an indefinite processing loop
    let currentLine = lineSegments.shift(); // Extract the first line from the array for current operation
    let parts = currentLine.split(" "); // Divide the current line into its constituent parts based on space delimiter

    let firstOperand = parts[0] - 0; // Convert the first part to a numerical value
    let secondOperand = parts[1] - 0; // Convert the second part to a numerical value (will be NaN if it's the operator string)

    // Evaluate the operator to determine the required action
    if (parts[1] === "%") { // If the operator is the modulo symbol, it signifies termination
        break; // Exit the infinite loop
    }

    if (parts[1] === "+") { // If the operator is addition
        console.log(firstOperand + secondOperand); // Perform addition and print the result
    }

    if (parts[1] === "-") { // If the operator is subtraction
        console.log(firstOperand - secondOperand); // Perform subtraction and print the result
    }

    if (parts[1] === "*") { // If the operator is multiplication
        console.log(firstOperand * secondOperand); // Perform multiplication and print the result
    }

    if (parts[1] === "/") { // If the operator is division
        console.log(~~(firstOperand / secondOperand)); // Perform integer division (truncating towards zero) and print the result
    }
}
