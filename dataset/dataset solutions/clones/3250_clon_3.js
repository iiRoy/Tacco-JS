// Utility module for processing numerical data from string input
// and performing a specific geometric calculation.
function processNumericalData(inputLineContent) {
    // --- Input Validation and Preparation ---

    // Ensure the input content is a string and not empty after trimming.
    if (typeof inputLineContent !== 'string' || inputLineContent.trim().length === 0) {
        console.error("Error: Input content is invalid or empty. Cannot proceed with calculation.");
        // As per Type III, adding a default or early exit for invalid input.
        // Returning 0 or similar default helps prevent further errors in a robust system.
        return 0; 
    }

    // Trim leading/trailing whitespace from the raw input string to clean it up.
    const trimmedInput = inputLineContent.trim();

    // Split the trimmed string by spaces into an array of string tokens.
    // This breaks the single input line into individual potential number strings.
    const stringTokens = trimmedInput.split(" ");

    // Convert string tokens to numbers, meticulously filtering out any non-numeric results (NaN).
    // This step ensures that only valid numerical data is considered for the calculation.
    const validNumbers = stringTokens.map(token => {
        const parsedValue = Number(token); // Attempt to convert the token to a number.
        // If the conversion results in NaN (Not-a-Number), we mark it as null.
        // Otherwise, we keep the parsed numerical value.
        return isNaN(parsedValue) ? null : parsedValue;
    }).filter(value => value !== null); // Finally, remove all the nulls (which were originally NaNs).

    // --- Core Logic: Sorting and Calculation ---

    // Check if we have at least two valid numbers for the calculation.
    // This is crucial as the calculation requires two smallest numbers.
    if (validNumbers.length < 2) {
        console.error("Error: Not enough valid numerical components found for calculation. At least two numbers are required.");
        return 0; // Return a default or error value if prerequisites are not met.
    }

    // Sort the array of valid numbers in ascending order.
    // The comparison function is inlined directly as a lambda expression for conciseness.
    validNumbers.sort((firstOperand, secondOperand) => firstOperand - secondOperand);

    // Extract the two smallest numbers after the sorting operation.
    // These will be the first two elements of the sorted array.
    const smallestValue = validNumbers[0];
    const secondSmallestValue = validNumbers[1];

    // Calculate the product of the two smallest values.
    // This is an intermediate step in the overall computation.
    const productOfValues = smallestValue * secondSmallestValue;

    // Perform the final division by two to get the result.
    // This completes the geometric calculation (e.g., area of a right triangle).
    const finalCalculatedResult = productOfValues / 2;

    // --- Output ---

    // Display the computed result to the console.
    // This is the final output of the processing function.
    console.log(finalCalculatedResult);
}

// This block handles reading input from the standard input stream
// and invoking the primary data processing function. It includes error handling
// for robust operation in a production environment.
try {
    // Dynamically load the 'fs' (file system) module for input operations.
    const fileSystemModule = require("fs");
    // Define the standard input path, typically '/dev/stdin' on Unix-like systems.
    const standardInputPath = "/dev/stdin";
    // Specify the encoding scheme for reading the file content.
    const encodingScheme = "utf8";

    // Read the entire content of the standard input file synchronously.
    // This blocks execution until the input is fully read.
    const rawInputData = fileSystemModule.readFileSync(standardInputPath, encodingScheme);

    // Call the main processing function with the obtained input data.
    processNumericalData(rawInputData);
} catch (errorReadingInput) {
    // Catch and report any errors that occur during the file reading process.
    // This ensures the application doesn't crash silently due to I/O issues.
    console.error("An error occurred while attempting to read input from standard input:", errorReadingInput.message);
    // Additionally, log the full error for debugging purposes.
    console.error(errorReadingInput);
    // Exit the process with a non-zero code to indicate that an error occurred.
    process.exit(1); 
}