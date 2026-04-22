function processInputData(rawDataString) {
    // This function handles the primary logic of processing the input data.
    // It iterates through datasets, calculates combinations, and outputs results.

    // Split the entire raw input string into individual lines for processing.
    const sourceLines = rawDataString.split("\n");

    // Initialize an index to keep track of the current line being processed.
    let currentLineIndex = 0;

    // Begin a loop to process each dataset until a termination condition is met.
    while (true) {
        // Ensure there are still lines available to process in the input.
        if (currentLineIndex >= sourceLines.length) {
            // No more data lines, exit the processing loop.
            break;
        }

        // Retrieve the current line, removing any leading/trailing whitespace.
        const lineContent = sourceLines[currentLineIndex].trim();
        // Advance the line index for the next iteration.
        currentLineIndex++;

        // Skip any lines that are empty after trimming.
        if (lineContent.length === 0) {
            continue;
        }

        // Split the line content by space to get individual string values.
        const stringComponents = lineContent.split(" ");

        // Parse the first component as the upper limit for numbers (n).
        const maxLimit = parseInt(stringComponents[0], 10);
        // Parse the second component as the target sum for the triplet (x).
        const desiredSum = parseInt(stringComponents[1], 10);

        // Check for the termination condition: both parameters are zero.
        if (maxLimit === 0 && desiredSum === 0) {
            // If both are zero, it signals the end of input, so break the loop.
            break;
        }

        // --- Guard Clauses for Optimization and Early Exit ---

        // If the upper limit is less than 3, it's impossible to form a triplet of distinct numbers.
        if (maxLimit < 3) {
            console.info(0); // Output 0 combinations.
            continue;        // Move to the next dataset.
        }

        // Calculate the minimum and maximum possible sums for a triplet (1 <= i < j < k <= maxLimit).
        const minimumPossibleTripletSum = 1 + 2 + 3;
        const maximumPossibleTripletSum = maxLimit + (maxLimit - 1) + (maxLimit - 2);

        // If the desired sum is outside the possible range, no combinations exist.
        if (desiredSum < minimumPossibleTripletSum || desiredSum > maximumPossibleTripletSum) {
            console.info(0); // Output 0 combinations.
            continue;        // Move to the next dataset.
        }

        // Initialize a counter for valid combinations found in the current dataset.
        let validCombinationCount = 0;

        // Outer loop for the first number 'i'.
        // 'i' must be at least 1 and at most maxLimit - 3 (to leave room for j and k).
        for (let firstCandidate = 1; firstCandidate < maxLimit - 2; firstCandidate++) {
            // Middle loop for the second number 'j'.
            // 'j' must be greater than 'i' and at most maxLimit - 2 (to leave room for k).
            for (let secondCandidate = firstCandidate + 1; secondCandidate < maxLimit - 1; secondCandidate++) {
                // Calculate the required value for the third number 'k'.
                const sumOfFirstTwo = firstCandidate + secondCandidate;
                const thirdCandidate = desiredSum - sumOfFirstTwo;

                // Define the valid range for the third number 'k'.
                // 'k' must be greater than 'j'.
                const minimumThirdValue = secondCandidate + 1;
                // 'k' must be less than or equal to 'maxLimit'.
                const maximumThirdValue = maxLimit;

                // Check if the calculated 'k' falls within its valid range.
                if (thirdCandidate >= minimumThirdValue && thirdCandidate <= maximumThirdValue) {
                    // If 'k' is valid, increment the combination counter.
                    validCombinationCount++;
                }
            }
        }
        // After checking all possible triplets for the current dataset, output the total count.
        console.info(validCombinationCount);
    }
}

// Helper function to abstract the file system reading.
function retrieveInputSource() {
    // Access the Node.js file system module.
    const fileSystemAccess = require("fs");
    // Define the standard input path.
    const standardInputPath = "/dev/stdin";
    // Read the content of the standard input file synchronously, ensuring UTF-8 encoding.
    return fileSystemAccess.readFileSync(standardInputPath, "utf8");
}

// Execute the main processing function with the retrieved input.
processInputData(retrieveInputSource());