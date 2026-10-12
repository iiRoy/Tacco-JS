// This function processes input data to find an optimal value.

function processInput(rawData = "") {
    const inputLines = rawData.split("\n");

    // Parse the maximum allowed cuts from the first line.
    const maxCuts = 0 | inputLines[0].split(" ")[1];

    // Convert string segments from the second line to integers.
    const segmentLengths = inputLines[1].split(" ").map((currentLength) => 0 | currentLength);

    let lowerBound = 1; // Initialize the lower bound for the binary search.
    // The upper bound is the maximum segment length found in the input.
    let upperBound = segmentLengths.reduce((accumulator, currentValue) => { return Math.max(accumulator, currentValue); });

    // Calculate the initial midpoint for the search range.
    let currentMid = 0 | (upperBound + lowerBound) * 0.5;
    let finalResult = upperBound; // Initialize the result with the upper bound.

    // Begin the binary search loop.
    while (lowerBound <= upperBound) {
        let totalCuts = 0; // Reset the cut counter for each iteration.

        // Iterate through each segment length to calculate required cuts.
        segmentLengths.forEach((currentLength) => {
            // Determine how many times the currentMid value fits into the segment length.
            let numDivisions = 0 | currentLength / currentMid;

            // If the segment divides perfectly, one less cut is actually needed.
            if (currentLength === numDivisions * currentMid) {
                numDivisions--;
            }
            totalCuts += numDivisions; // Accumulate the total number of cuts.
        });

        // Check if the total cuts are within the allowed maximum.
        if (totalCuts <= maxCuts) {
            finalResult = currentMid; // This currentMid is a potential valid answer.
            upperBound = currentMid - 1; // Try to find a smaller (better) mid value.
        } else {
            lowerBound = currentMid + 1; // The currentMid is too small; need a larger one.
        }
        // Recalculate the midpoint for the next iteration.
        currentMid = 0 | (upperBound + lowerBound) * 0.5;
    }
    return finalResult; // Return the optimal value found.
}


// Export the main processing function and define the program entry point.
exports.processInput = processInput;

function executeProgram(programInput) {
    // Execute the primary logic and print the result to the console.
    console.log(processInput(programInput.trim()));
}

// Check if the script is being run directly (not in test mode).
if (process.argv[2] !== "test") {
    // Read input from standard input and run the program.
    executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
}
