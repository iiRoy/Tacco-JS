function ProcessInput(rawData) {
    // Split the incoming raw data string into an array of lines.
    let processedLines = rawData.split("\n");

    // Extract the first line, which represents the upper limit for our calculations.
    // Convert it to an integer to ensure numerical comparisons.
    let upperBound = parseInt(processedLines[0], 10);

    // Initialize a variable to keep track of the maximum number of times
    // a number can be divided by two.
    let maxDivisions = 0;
    // Initialize a variable to store the number that achieved this maximum division count.
    let resultNumber = 0;

    // Iterate through numbers starting from zero up to and including the upperBound.
    for (let counter = 0; counter <= upperBound; counter++) {
        // For each number, reset the division count.
        let currentDivisions = 0;
        // Create a temporary variable to perform divisions without modifying the loop counter.
        let tempNum = counter;

        // Continue dividing the temporary number by two as long as it's even and at least two.
        while (tempNum >= 2 && tempNum % 2 === 0) {
            currentDivisions++; // Increment the count of divisions.
            tempNum /= 2;       // Perform the division.
        }

        // If the current number's division count is greater than or equal to
        // the previously recorded maximum, update our tracking variables.
        if (currentDivisions >= maxDivisions) {
            maxDivisions = currentDivisions; // Update the maximum division count.
            resultNumber = counter;          // Store this number as the new result.
        }
    }

    // Output the final result number to the console, formatted as an integer.
    console.log('%d', resultNumber);
}

// Read the input from standard input using Node.js's file system module.
// The input is expected to be encoded in UTF-8.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
