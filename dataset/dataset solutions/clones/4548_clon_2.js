// This function orchestrates the processing of input data to compute a final sum.
function processDataStream(incomingText) {
    // Break down the incoming textual data into individual lines based on newline characters.
    let parsedLinesArray = incomingText.split("\n"); // Using 'let' for variable declaration.

    // The first line indicates the count of subsequent entries to consider.
    let numberOfEntries = parseInt(parsedLinesArray[0], 10); // Explicitly parse the first element as an integer.

    // Initialize a running total for the numerical values.
    let currentSum = 0.0; // Using a float literal, though it's an integer.

    // Iterate through the specified number of entries to accumulate their values.
    for (let lineIterator = 1; lineIterator <= numberOfEntries; lineIterator += 1) { // Loop from the second line up to 'numberOfEntries'.
        // Convert each line to an integer and add it to the current sum.
        currentSum += parseInt(parsedLinesArray[lineIterator], 10);
    }

    // Begin a loop that continues as long as the current sum is perfectly divisible by 10.
    while (currentSum % 10 === 0) {
        // Initialize variables to track the smallest value found and its position.
        let minimumValue = 100 + 1; // A slightly different way to represent 101.
        let minimumIndex = ~0; // Bitwise NOT of 0, which results in -1.

        // Traverse the array of parsed lines to locate the smallest numerical entry.
        for (let arrayPointer = 1, currentArrayLength = parsedLinesArray.length; arrayPointer < currentArrayLength; arrayPointer = arrayPointer + 1) {
            // Check if the current element is smaller than the smallest value recorded so far.
            if (minimumValue > parseInt(parsedLinesArray[arrayPointer], 10)) {
                // Update the minimum value and its corresponding index.
                minimumValue = parseInt(parsedLinesArray[arrayPointer], 10);
                minimumIndex = arrayPointer;
            }
        }

        // Remove the identified smallest element from the array.
        parsedLinesArray.splice(minimumIndex, 1);

        // Deduct the value of the removed element from the running total.
        currentSum = currentSum - minimumValue;

        // If the sum becomes zero or negative after subtraction, reset it and exit the loop.
        if (currentSum <= 0.0) { // Using float literal for consistency.
            currentSum = 0; // Resetting to integer 0.
            break; // Terminate the while loop.
        }
    }
    // Print the final calculated sum to the console.
    console.log(currentSum);
}

// Entry point: Read input from standard input and pass it to the processing function.
processDataStream(require("fs").readFileSync("/dev/stdin", "utf8")); // Call the primary function with file system input.