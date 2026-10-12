// This function processes the provided data.
function ProcessInput(rawData) {
    // The rawData parameter contains the entire input content.
    rawData = rawData; // Retaining the structure, though it's a self-assignment.
    let upperBound = Number(rawData); // Convert the input string to a numerical upper limit.
    let finalCount = 0; // Initialize a counter for numbers meeting the criteria.

    // Iterate through numbers starting from one up to (but not including) the upper bound.
    for (let currentNumber = 1; currentNumber < upperBound; currentNumber++) {
        // Check if the string representation of the current number has an odd length.
        if (String(currentNumber).length % 2 === 1) {
            finalCount++; // Increment the counter if the condition is met.
        }
    }

    // Output the total count of numbers with odd-length string representations.
    console.log(finalCount);
}

// Do not modify the following lines; they handle standard input/output and function invocation.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
