var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input data is split into an array of lines.
var lineBuffer = rawData.trim().split("\n");

// This loop continues processing input sets until a specific termination condition is met.
while (true) {
    // Retrieve the first line of the current input set.
    var currentLine = lineBuffer.shift();

    // Check if the current line signifies the end of input.
    if (currentLine === "0 0 0 0 0") {
        break; // Exit the loop if the termination sequence is found.
    }

    // Combine the current line with the next line, then parse all numbers into an array.
    var parsedValues = (currentLine + " " + lineBuffer.shift()).split(" ").map(Number);

    // An immediately invoked function expression (IIFE) is used to encapsulate the calculation logic
    // for the current set of input values.
    (function (valA, valB, valC, valD, valE, countA, countB, countC) {
        // Initialize a variable to store the accumulated result.
        var totalResult = 0;

        // Calculate the remainder when 'countC' is divided by 'valD'.
        var remainderVal = countC % valD;

        // Calculate the integer quotient of 'countC' divided by 'valD'.
        var quotientVal = (countC - remainderVal) / valD;

        // Determine how many items are needed to complete the current 'valD' block.
        var remainingItems = valD - remainderVal;

        // Add the cost for the full 'valD' blocks.
        totalResult += quotientVal * valD * valE;

        // Conditional logic based on comparing two cost scenarios.
        if (remainderVal * valC <= valD * valE) {
            // If the cost of the remainder is less than or equal to a full block's cost.
            totalResult += valD * valE; // Add the cost of a full block.

            // Decrement 'countA' or 'countB' for the 'remainingItems' without adding individual costs.
            while (remainingItems--) {
                if (countA > 0) {
                    countA--;
                } else if (countB > 0) {
                    countB--;
                }
            }
        } else {
            // If the cost of the remainder is greater than a full block's cost.
            totalResult += remainderVal * valE; // Add the cost specifically for the remainder.

            // Decrement 'countA' or 'countB' for the 'remainingItems', adding 'valE' for each.
            while (remainingItems--) {
                if (countA > 0) {
                    countA--;
                    totalResult += valE; // Add 'valE' for each item from 'countA'.
                } else if (countB > 0) {
                    countB--;
                    totalResult += valE; // Add 'valE' for each item from 'countB'.
                }
            }
        }

        // Add the costs for any remaining 'countA' and 'countB' items.
        totalResult += valA * countA + valB * countB;

        // Output the final calculated total result.
        console.log(totalResult);

    }).apply(null, parsedValues); // Pass the 'parsedValues' array as arguments to the IIFE.
}
