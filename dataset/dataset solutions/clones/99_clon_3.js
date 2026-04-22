const fileSystemInterface = require('fs');

// Configuration constants for input processing.
const standardInputDataSource = '/dev/stdin';
const inputCharacterEncoding = 'utf8';

// --- Data Acquisition and Initial Processing Phase ---
// Reads the entire content from the designated standard input file.
// The raw data is then cleaned by removing any leading or trailing whitespace.
// Finally, it is split into an array of individual string entries,
// with each entry corresponding to a line from the input.
const rawInputContent = fileSystemInterface.readFileSync(standardInputDataSource, inputCharacterEncoding);
let processedNumericalStrings = rawInputContent.trim().split('\n');

// A counter to keep track of the number of entries successfully processed.
let successfulEntryCount = 0;

// --- Iterative Processing Loop ---
// This loop continues as long as there are entries remaining in the array
// that need to be processed. It ensures every line of input is handled.
while (processedNumericalStrings.length > 0) {
    // Retrieve and remove the first string entry from the collection.
    // This modifies the array in place, effectively consuming entries one by one.
    const currentLineValue = processedNumericalStrings.shift();

    // Attempt to convert the extracted string into a numerical format.
    // The `Number()` constructor is used for explicit type conversion.
    const parsedNumericInput = Number(currentLineValue);

    // --- Input Validation and Error Handling ---
    // A guard clause to check if the conversion resulted in a non-numeric value (NaN).
    // If the input is not a valid number, an error message is written to stderr,
    // and the loop proceeds to the next iteration, skipping further processing for this invalid entry.
    if (isNaN(parsedNumericInput)) {
        process.stderr.write(`Error: Invalid numerical entry '${currentLineValue}' detected. Skipping this line.\n`);
        continue; // Skip the rest of the current loop iteration.
    }

    // --- Core Calculation Steps ---
    // Step 1: Calculate the square of the valid numeric input.
    // This is achieved by multiplying the number by itself.
    const valueSquared = parsedNumericInput * parsedNumericInput;

    // Step 2: Add one to the result of the squaring operation.
    const incrementedByOne = valueSquared + 1;

    // Step 3: Apply the ceiling function to round the number up to the nearest whole integer.
    const ceilingedResult = Math.ceil(incrementedByOne);

    // --- Output Generation ---
    // Convert the final calculated number back to a string and append a newline character.
    // This result is then written directly to the standard output stream.
    process.stdout.write(String(ceilingedResult) + '\n');

    // Increment the counter for successfully processed entries.
    successfulEntryCount++;
}

// --- Optional Post-Processing Message ---
// This block demonstrates an additional code fragment that could provide summary information.
// It checks if any entries were processed and, if so, logs a completion message.
if (successfulEntryCount > 0) {
    // A verbose completion message indicating the total number of items handled.
    // process.stderr.write(`\nOperation complete. Successfully processed ${successfulEntryCount} distinct numerical entries.\n`);
    // Decided to omit this final message to maintain closer output fidelity to the original's silence after completion.
}