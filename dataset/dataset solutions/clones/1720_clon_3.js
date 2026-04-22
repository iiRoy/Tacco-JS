function processInputData(rawDataString) {
    // This function is designed to process a raw string input, which is expected
    // to contain numerical data, typically sourced from standard input.
    // It calculates a specific mathematical series based on the first valid number found.

    // Type III: Add a robust guard clause for initial input validation.
    // Ensure the raw input string is not empty or composed solely of whitespace.
    if (!rawDataString || typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
        console.error("Error: Input data is either empty, not a string, or contains only whitespace. Cannot proceed.");
        return; // Exit early if input is invalid.
    }

    // Type II/III: Process the raw string into an array of lines.
    // First, trim any leading/trailing whitespace from the entire input string
    // to handle common input formatting quirks, then split by newline characters.
    const processedLines = rawDataString.trim().split('\n');

    // Type III: Add validation to ensure at least one line of content was parsed.
    if (processedLines.length === 0) {
        console.error("Error: No discernible lines of content found after splitting the input string.");
        return;
    }

    // Type II: Rename 'a' to 'baseNumericValue' and extract the first line.
    // We are interested in the first line of the input for our calculation.
    const firstContentLine = processedLines[0];

    // Attempt to parse the first line's content into an integer.
    // Using Number.parseInt for explicit base-10 conversion.
    let baseNumericValue = Number.parseInt(firstContentLine, 10);

    // Type III: Add validation to check if the parsed value is a valid number.
    if (Number.isNaN(baseNumericValue)) {
        console.error(`Error: The first line '${firstContentLine}' could not be successfully converted into a valid integer.`);
        return; // Exit if the parsing failed.
    }

    // Type III: Introduce intermediate variables to break down the calculation.
    // Calculate the square of the base value.
    const valueSquared = baseNumericValue * baseNumericValue;

    // Calculate the cube of the base value by multiplying the square by the base again.
    const valueCubed = valueSquared * baseNumericValue;

    // Type II: Rename 'result' to 'calculatedSeriesSum'.
    // Type III: Rewrite the core calculation using the newly defined intermediate variables.
    // The final calculation is the sum of the base value, its square, and its cube.
    const calculatedSeriesSum = baseNumericValue + valueSquared + valueCubed;

    // Type III: Modify the output to be more descriptive and user-friendly.
    // Display the final computed sum, clearly indicating what the output represents.
    console.log(`The computed sum of (N + N^2 + N^3) for N=${baseNumericValue} is: ${calculatedSeriesSum}`);
}

// This section handles the execution of the processing function.
// It reads input from standard input using Node.js's file system module.
// The '/dev/stdin' path is standard for reading from stdin in many Unix-like environments.
// The 'utf8' encoding ensures the input is read as a human-readable string.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));