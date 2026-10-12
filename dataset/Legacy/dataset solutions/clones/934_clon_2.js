var outputFn = console.log;

// Check if running in a Node.js environment to handle standard input
if (typeof process !== "undefined") {
    var rawInputData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    // Accumulate incoming data chunks
    process.stdin.on('data', function (dataSegment) {
        rawInputData += dataSegment;
    });

    // Process all input once the stream ends
    process.stdin.on('end', function () {
        var inputLines = rawInputData.split("\n");
        processAllInput(inputLines);
    });
}

// Main function to orchestrate processing of multiple datasets
function processAllInput(inputLines) {
    // The first line is often a count of test cases, but it's discarded here.
    inputLines.shift();

    // Loop through the remaining lines, processing two at a time
    while (inputLines.length > 0) {
        // Extract two lines to form a dataset
        var pairOfStrings = inputLines.slice(0, 2);

        // Cleanse each string in the dataset:
        // - Split into characters
        // - Filter out non-lowercase-alphabet characters
        // - Join back into a single string
        pairOfStrings = pairOfStrings.map(function (currentLine) {
            return currentLine.split("").filter(function (charElement) {
                var charCodeValue = charElement.charCodeAt(0);
                // Keep only characters 'a' through 'z'
                return 97 <= charCodeValue && charCodeValue <= 122;
            }).join("");
        });

        // Pass the cleaned dataset to the core processing logic
        analyzeStringPair(pairOfStrings);

        // Remove the two processed lines from the input array
        inputLines = inputLines.slice(2);
    }
}

// Core function to analyze a pair of strings using dynamic programming
function analyzeStringPair(pairOfStrings) {
    var dpMatrix = []; // This matrix will store intermediate results
    var firstString = pairOfStrings[0];
    var secondString = pairOfStrings[1];

    try {
        // Iterate through each character of the first string
        for (var rowIdx = 0; rowIdx < firstString.length; rowIdx++) {
            dpMatrix[rowIdx] = []; // Initialize the current row

            // Iterate through each character of the second string
            for (var colIdx = 0; colIdx < secondString.length; colIdx++) {
                // Determine if the current characters match
                if (firstString.charAt(rowIdx) === secondString.charAt(colIdx)) {
                    dpMatrix[rowIdx][colIdx] = 1; // Match found
                } else {
                    dpMatrix[rowIdx][colIdx] = 0; // No match
                }

                // Apply dynamic programming rules based on position
                if (rowIdx === 0 && colIdx === 0) {
                    // For the very first cell, no change needed (base case)
                    dpMatrix[rowIdx][colIdx] += 0;
                } else if (rowIdx === 0) {
                    // For the first row (excluding first cell),
                    // take the maximum from the left or current value
                    dpMatrix[rowIdx][colIdx] = Math.max(dpMatrix[rowIdx][colIdx - 1], dpMatrix[rowIdx][colIdx]);
                } else if (colIdx === 0) {
                    // For the first column (excluding first cell),
                    // take the maximum from above or current value
                    dpMatrix[rowIdx][colIdx] = Math.max(dpMatrix[rowIdx - 1][colIdx], dpMatrix[rowIdx][colIdx]);
                } else {
                    // For all other cells, apply the main recurrence relation
                    // This involves a combination of values from above and left,
                    // and a constraint based on the minimum of current indices.
                    dpMatrix[rowIdx][colIdx] = Math.min(
                        Math.max(dpMatrix[rowIdx - 1][colIdx], dpMatrix[rowIdx][colIdx - 1]) + dpMatrix[rowIdx][colIdx],
                        Math.min(rowIdx, colIdx) + 1
                    );
                }
            }
        }
        // Output the final computed value from the bottom-right cell of the matrix
        outputFn(dpMatrix[rowIdx - 1][colIdx - 1]);
    } catch (caughtError) {
        // Log any errors that occur during processing
        outputFn(caughtError);
    }
}
