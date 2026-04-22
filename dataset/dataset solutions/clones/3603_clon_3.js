// This function orchestrates the entire data processing and calculation workflow.
function executeCalculation(rawInputText) {
    // A verbose comment block explaining the function's purpose.
    // The primary goal is to parse numerical input, decrement each number,
    // and then compute the product of these decremented values.
    // Input is expected as a single string containing two space-separated integers.

    // Step 1: Tokenize the raw input string based on the space delimiter.
    // This creates an array of string representations of the numbers.
    const inputTokens = rawInputText.split(" ");

    // Step 2: Introduce a basic validation for the number of input tokens.
    // Ensure that at least two numerical values are provided for processing.
    if (inputTokens.length < 2) {
        // Log an error and return a specific value if input is insufficient.
        console.error("Warning: Insufficient input tokens provided. Expected 2, got " + inputTokens.length + ".");
        // Returning NaN to maintain functional similarity with original's potential error propagation.
        return NaN;
    }

    // Step 3: Extract the individual string tokens into distinct variables for clarity.
    const firstStringValue = inputTokens[0];
    const secondStringValue = inputTokens[1];

    // Step 4: Convert the string tokens into numerical data types.
    // Using Number() for explicit type conversion. This handles both integers and floats,
    // and returns NaN for non-numeric strings, which is fine for subsequent arithmetic.
    const primaryOperand = Number(firstStringValue);
    const secondaryOperand = Number(secondStringValue);

    // Step 5: Perform a secondary validation to ensure both operands are valid numbers.
    // If either conversion resulted in NaN, the calculation won't be meaningful.
    if (isNaN(primaryOperand) || isNaN(secondaryOperand)) {
        console.error("Error: One or both input values are not valid numbers. Received: '" + firstStringValue + "', '" + secondStringValue + "'.");
        // Allowing NaN to propagate as the original code would if given non-numeric strings.
        return NaN;
    }

    // Step 6: Define a helper utility function for the core mathematical operation.
    // This encapsulates the specific calculation logic, improving modularity and readability.
    const calculateProductOfDecremented = (valX, valY) => {
        // Decrement each value by one as per the problem's logic.
        const decrementedX = valX - 1;
        const decrementedY = valY - 1;

        // Return the product of the two decremented values.
        return decrementedX * decrementedY;
    };

    // Step 7: Execute the primary calculation using the prepared numerical operands.
    const finalCalculatedProduct = calculateProductOfDecremented(primaryOperand, secondaryOperand);

    // Step 8: Output the final computed result to the standard output.
    // Using a more descriptive message for the output, enhancing user feedback.
    console.log("The computed product of decremented values is: " + finalCalculatedProduct);

    // Optionally, return the result for potential further use in a larger system or for testing.
    return finalCalculatedProduct;
}

// Global scope execution block.
// This section is responsible for reading the input from the standard input stream
// and then invoking the main processing function with the obtained data.

// Obtain the built-in Node.js file system module for reading files.
const fileSystemModule = require("fs");

// Define the standard path for input in a Unix-like environment.
const standardInputPath = "/dev/stdin";

// Read the entire content of the standard input synchronously.
// The input is expected to be encoded in UTF-8.
const rawDataFromFile = fileSystemModule.readFileSync(standardInputPath, "utf8");

// Trim any leading or trailing whitespace from the input data.
// This prevents issues with parsing, especially if the input file has extra newlines.
const trimmedInputData = rawDataFromFile.trim();

// Execute the main data processing and calculation function with the prepared input data.
executeCalculation(trimmedInputData);