var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input path
var lineBuffer = rawData.trim().split("\n"); // Process raw input: remove leading/trailing whitespace and split into an array of lines

while (true) { // Begin an infinite loop to process multiple test cases
    var currentLineSegment = lineBuffer.shift(); // Extract the first line from the buffer for current processing

    if (currentLineSegment === "0 0 0 0 0") { // Check for the specific termination condition string
        break; // Exit the loop if the termination string is encountered
    }

    // Combine the current line segment with the next line from the buffer,
    // then split by spaces and convert all parts to numbers.
    var parsedValues = (currentLineSegment + " " + lineBuffer.shift()).split(" ").map(Number);

    (function (val1, val2, val3, val4, val5, countA, countB, countC) { // Define and immediately invoke a function with the parsed values
        var resultOne, resultTwo; // Declare variables to hold two different calculated outcomes

        var remainderVal = countC % val4; // Calculate the remainder of countC divided by val4

        // Calculate the first possible result (resultOne) based on a specific formula
        resultOne = countA * val1 + countB * val2 + Math.floor(countC / val4) * val4 * val5 + remainderVal * val3;

        if (countC >= val4) { // Check if countC is greater than or equal to val4
            // If true, calculate resultTwo using a direct multiplication
            resultTwo = countA * val1 + countB * val2 + countC * val5;
        } else {
            // If false, calculate a deficit amount
            var deficitAmount = val4 - remainderVal;

            while (deficitAmount--) { // Loop while deficitAmount is positive, decrementing it in each iteration
                if (countB > 0) { // Prioritize decrementing countB if it's positive
                    countB--;
                } else if (countA > 0) { // If countB is zero, then decrement countA if it's positive
                    countA--;
                }
            }
            // Calculate resultTwo after potentially adjusting countA and countB
            resultTwo = countA * val1 + countB * val2 + val4 * val5;
        }

        console.log(Math.min(resultOne, resultTwo)); // Output the smaller of the two calculated results
    }).apply(null, parsedValues); // Apply the parsed values as arguments to the IIFE
}
