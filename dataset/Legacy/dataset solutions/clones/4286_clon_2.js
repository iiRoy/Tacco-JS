function ProcessInputData(rawData) {
    // This function takes raw input data as a string and performs a specific calculation.

    // First, split the entire input string into an array of individual lines.
    let processedLines = rawData.split("\n");

    // Calculate the initial base value: 3 raised to the power of the number found on the first line.
    // Math.pow automatically handles string-to-number conversion for its arguments.
    const powerResult = Math.pow(3, processedLines[0]);

    // Initialize a variable to accumulate a product, starting with 1.
    let productAccumulator = 1;

    // Parse the second line of input: split it by spaces and convert each part to a number.
    const numericSequence = processedLines[1].split(" ").map(Number);

    // Iterate over each element in the newly created numeric sequence.
    numericSequence.forEach(function(currentElement) {
        // Check if the current number is an even number.
        if (currentElement % 2 === 0) {
            // If it's even, multiply the product accumulator by 2.
            productAccumulator *= 2;
        }
    });

    // Finally, compute the difference between the power result and the accumulated product,
    // then print this final value to the console.
    console.log(powerResult - productAccumulator);
}

// The program execution starts here.
// It reads the entire content from standard input, converts it to UTF-8,
// removes any leading/trailing whitespace, and then passes it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
