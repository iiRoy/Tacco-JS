// This routine handles the primary execution flow of the application.
function entryPoint(rawTextualData) {
    // First, we ensure the incoming string is free of leading or trailing whitespace.
    rawTextualData = rawTextualData.trim();

    // Next, parse the cleaned string into an array of numbers.
    // The string is expected to contain space-separated numeric values.
    const numericComponents = rawTextualData
        .split(" ") // Divide the string by spaces
        .map(Number); // Convert each segment into a numerical type

    // Calculate the product of the first two components, then compare it with the third component.
    // Display the smallest value among these two results.
    console.log(
        Math.min(
            numericComponents[0] * numericComponents[1], // Product of the initial two values
            numericComponents[2]                           // The third value
        )
    );
}

// Initiate the processing by reading data from standard input.
// The input is expected to be a UTF-8 encoded string.
entryPoint(
    require('fs')
        .readFileSync('/dev/stdin', 'utf8')
);