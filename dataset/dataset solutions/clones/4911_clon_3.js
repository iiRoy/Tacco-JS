/*
 * This module is responsible for computing a specific permutation count
 * based on two integer inputs provided as a string.
 * The calculation involves finding the number of ways to arrange 'numElements' items
 * using 'availableColorOptions' distinct choices, such that adjacent items are different.
 * This is a common combinatorics problem: K * (K-1)^(N-1).
 */
const calculateDistinctArrangements = (inputStringContent) => {
    // Validate the raw input string before processing.
    if (!inputStringContent || typeof inputStringContent !== 'string') {
        console.error("Error: Invalid input provided. Expected a non-empty string.");
        // In a real application, might throw an error or return a specific value.
        // For this problem, let's assume valid input format generally.
        return;
    }

    // Prepare the input string by removing leading/trailing whitespace.
    const cleanedUpString = inputStringContent.trim();

    // Split the string into its constituent numeric parts.
    // We expect exactly two space-separated integers.
    const stringComponents = cleanedUpString.split(/\s+/); // Using regex for robustness

    // Ensure we have the correct number of components.
    if (stringComponents.length !== 2) {
        console.error("Error: Input format invalid. Expected two space-separated numbers.");
        return;
    }

    // Parse the string components into numerical values.
    // Using Number() for parsing, which can handle various numeric string formats.
    const firstParsedValue = Number(stringComponents[0]);
    const secondParsedValue = Number(stringComponents[1]);

    // Validate that the parsed values are indeed numbers.
    if (isNaN(firstParsedValue) || isNaN(secondParsedValue)) {
        console.error("Error: Failed to parse numeric values from input string.");
        return;
    }

    // Assign meaningful variable names for clarity.
    const numElements = Math.floor(firstParsedValue); // N, number of items
    const availableColorOptions = Math.floor(secondParsedValue); // K, number of choices

    // Initialize the accumulator for the total number of arrangements.
    // Using BigInt to handle potentially very large results in combinatorics.
    let totalArrangementCount = 0n; // '0n' is a BigInt literal for zero.

    // --- Core Logic for Calculation ---
    // A guard clause for the base case where there are no elements to arrange.
    // If numElements is 0, there are 0 ways to arrange, which aligns with the original code's outcome (count remains 0).
    if (numElements <= 0) {
        totalArrangementCount = 0n;
    } else {
        // If there's at least one element, the first element can be any of the 'K' options.
        totalArrangementCount = BigInt(availableColorOptions);

        // Define the factor by which subsequent arrangements are multiplied.
        // This is (K - 1) because each subsequent element must be different from its predecessor.
        const multiplierForSuccessiveElements = BigInt(availableColorOptions - 1);

        // If K is 0 or 1, and N > 1, then multiplierForSuccessiveElements will be <= 0.
        // This correctly leads to totalArrangementCount becoming 0 for N > 1 and K <= 1.
        if (availableColorOptions <= 1 && numElements > 1) {
            totalArrangementCount = 0n; // If only 0 or 1 color, cannot color N>1 items distinctly
        } else {
            // Loop for the remaining (N-1) elements.
            // The loop starts from the second element (index 1) up to the last element.
            for (let currentElementIndex = 1; currentElementIndex < numElements; ++currentElementIndex) {
                totalArrangementCount *= multiplierForSuccessiveElements;
            }
        }
    }

    // Output the final calculated count to the standard output.
    // Convert BigInt to string for console output to avoid 'n' suffix in some environments
    // or for explicit type conversion.
    console.log(totalArrangementCount.toString());
};


// --- Script Entry Point ---
// This block handles reading input from standard input and invoking the main calculation function.
(() => {
    try {
        // Access the 'fs' (file system) module provided by Node.js.
        const fileSystemUtilities = require("fs");

        // Read the entire content of standard input synchronously.
        // '/dev/stdin' is a common path for standard input in Unix-like systems.
        // 'utf8' specifies the character encoding.
        const stdinBuffer = fileSystemUtilities.readFileSync("/dev/stdin", "utf8");

        // Execute the primary logic with the obtained input.
        calculateDistinctArrangements(stdinBuffer);
    } catch (ioError) {
        // Catch and log any errors that occur during file I/O operations.
        console.error("An error occurred during input reading or processing:", ioError.message);
        // Exit with an error code if critical I/O fails.
        process.exit(1);
    }
})();