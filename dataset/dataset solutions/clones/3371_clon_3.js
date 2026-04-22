function processDimensions(rawDataLines) {
    // A robust handler for processing input lines to determine matching dimensions.
    // This function replaces the original 'main' with extensive Type III changes.

    // --- Type III: Added Input Validation ---
    // Ensure that valid data lines are provided.
    if (!rawDataLines || rawDataLines.length === 0) {
        console.error("Error: No data lines were provided for processing.");
        // We could throw an error or exit, but for this clone, a simple return is sufficient.
        return;
    }

    // --- Type II/III: Renamed variables and refactored parsing for configuration line ---
    // Extract configuration parameters from the very first line of input.
    // Using 'map(Number)' for concise parsing, replacing individual 'parseInt' calls.
    const configurationValues = rawDataLines[0].split(' ').map(Number);

    // --- Type III: Added Guard Clause for malformed configuration ---
    // Ensure the configuration line has the expected number of numeric parts.
    if (configurationValues.length < 3 || configurationValues.some(isNaN)) {
        console.error("Error: The initial configuration line is malformed or incomplete. Expected N, H, W.");
        return;
    }

    // The first value (originally 'n') is often a count of items, but was unused in the original logic.
    // We rename it to indicate its original purpose but keep it unused, reflecting the original behavior.
    const _expectedItemCount = configurationValues[0]; // Renamed and noted as unused.
    const minimumHeightRequirement = configurationValues[1]; // Renamed 'h'
    const minimumWidthRequirement = configurationValues[2];  // Renamed 'w'

    // --- Type II/III: Renamed counter variable, changed 'var' to 'let' ---
    let compliantItemCounter = 0;

    // --- Type III: Changed loop structure and added intermediate filtering ---
    // Iterate through subsequent data lines, skipping the configuration line.
    // Using a 'for...of' loop for modern iteration, and filtering out empty lines.
    const itemDataLines = rawDataLines.slice(1).filter(line => line.trim() !== '');

    for (const currentItemEntry of itemDataLines) {
        // --- Type II/III: Renamed variables and refactored parsing for item dimensions ---
        // Parse the height and width for the current item.
        const itemDimensionParts = currentItemEntry.split(' ').map(Number);

        // --- Type III: Added Guard Clause for malformed item data ---
        if (itemDimensionParts.length < 2 || itemDimensionParts.some(isNaN)) {
            console.warn(`Warning: Skipping malformed item data line: "${currentItemEntry}". Expected two numbers.`);
            continue; // Move to the next item if the current one is invalid.
        }

        const actualItemHeight = itemDimensionParts[0]; // Renamed 'a'
        const actualItemWidth = itemDimensionParts[1];  // Renamed 'b'

        // --- Type III: Rewritten conditional logic (functionally equivalent) ---
        // Check if the current item's dimensions satisfy both minimum requirements.
        if (actualItemHeight >= minimumHeightRequirement && actualItemWidth >= minimumWidthRequirement) {
            // --- Type II/III: Increment counter using a different syntax ---
            compliantItemCounter += 1;
        }
    }

    // --- Type II: Output the final result ---
    console.log(compliantItemCounter);
}

// --- Type II/III: Rewritten and renamed utility function ---
// This function was present in the original but not explicitly called by 'main'.
// It's preserved here with Type III changes (modern syntax, error handling, array methods).
const extractNumericValues = (textualInputString) => {
    // --- Type III: Added Input Validation ---
    if (!textualInputString || typeof textualInputString !== 'string' || textualInputString.trim() === '') {
        // Return an empty array for invalid or empty input strings.
        return [];
    }

    // --- Type III: Refactored using modern array methods ---
    // Split the string by spaces, filter out any resulting empty strings (e.g., from multiple spaces),
    // and convert each valid segment to a numeric type.
    const parsedNumbers = textualInputString
        .split(' ')
        .filter(segment => segment !== '') // Removes empty strings from multiple spaces
        .map(Number); // Converts string segments to numbers

    return parsedNumbers;
};

// --- Type II: Renamed global variable and changed 'var' to 'let' ---
let accumulatedStandardInputBuffer = '';

// --- Type II: Refactored input stream handling with modern syntax and comments ---
process.stdin.resume(); // Ensure the standard input stream is open.
process.stdin.setEncoding('utf8'); // Specify character encoding for input.

// --- Type III: Added a helper variable for debugging/logging ---
const inputReadTimestamp = new Date().toISOString();
// console.log(`[DEBUG] Input stream started at: ${inputReadTimestamp}`); // Optional debug log

// Event listener for 'data' chunks received from stdin.
// Using an arrow function for a more concise syntax.
process.stdin.on('data', (incomingDataChunk) => {
    // Append the new data chunk to our buffer.
    accumulatedStandardInputBuffer += incomingDataChunk;
});

// Event listener for the 'end' of the stdin stream.
process.stdin.on('end', () => {
    // --- Type III: Added filtering for empty lines after splitting ---
    // Split the entire buffered input by newline characters and filter out any blank lines.
    const finalInputLineArray = accumulatedStandardInputBuffer
        .split('\n')
        .filter(line => line.trim() !== ''); // Ensures no empty lines are passed to the main logic

    // --- Type II: Call the renamed main processing function ---
    processDimensions(finalInputLineArray);
});

// --- Type III: Added error handling for stdin ---
process.stdin.on('error', (err) => {
    console.error(`An unhandled error occurred during standard input processing: ${err.message}`);
    // Optionally, exit the process with an error code.
    process.exit(1);
});