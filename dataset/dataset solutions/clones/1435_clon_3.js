// This module is designed to process a sequence of textual data,
// performing a series of cyclic string shifts based on numerical parameters embedded within the stream.
// It reads tokens, interprets them as strings to manipulate and shift instructions,
// and outputs the transformed strings.

const ProcessTextualData = (incomingRawText) => {
    // Stage 1: Data Preparation and Tokenization.
    // Normalize line endings to ensure consistent splitting across different OS environments.
    // Then, split the entire input into individual tokens using any sequence of whitespace or newlines as delimiters.
    // Finally, filter out any empty string tokens that might result from the splitting process,
    // ensuring we only deal with meaningful data segments.
    let dataTokens = incomingRawText
                       .replace(/\r\n/g, '\n')      // Normalize Windows-style newlines
                       .split(/[\s\n]+/)            // Split by one or more whitespace/newline characters
                       .filter(Boolean);            // Remove any empty strings (e.g., from multiple spaces)

    let currentTokenIndex = 0; // Initialize an index to manage token consumption, replacing `shift()` calls.
    const terminationSentinel = "-"; // Define a constant for the loop termination marker.

    // Stage 2: Core Processing Loop.
    // This loop continues indefinitely until a specific termination condition is met,
    // allowing for processing multiple string transformation blocks.
    for (;;) {

        // Pre-check: Ensure there are enough tokens remaining before attempting to read the next string.
        // This acts as a robust guard against unexpected end-of-input scenarios.
        if (currentTokenIndex >= dataTokens.length) {
            console.warn("Warning: Input stream exhausted unexpectedly. Terminating processing.");
            break;
        }

        // Retrieve the string that is to be subjected to transformations.
        let targetStringForManipulation = dataTokens[currentTokenIndex++];

        // Check if the retrieved token is the designated sentinel value.
        // If so, it signals the end of the input sequence for processing.
        if (targetStringForManipulation === terminationSentinel) {
            // Comment: Termination signal received, exiting the main processing loop.
            break;
        }

        // Pre-check: Verify availability of the rotation cycle count after the string.
        if (currentTokenIndex >= dataTokens.length) {
            console.error("Error: Missing rotation count for string '%s'. Halting processing.", targetStringForManipulation);
            break;
        }

        // Extract and parse the number of rotation cycles for the current string.
        let rotationCountRaw = dataTokens[currentTokenIndex++];
        let numberOfRotations = Number(rotationCountRaw); // Use Number() for explicit type conversion.

        // Validate the parsed rotation count. It must be a non-negative integer.
        if (isNaN(numberOfRotations) || !Number.isInteger(numberOfRotations) || numberOfRotations < 0) {
            console.error(`Invalid rotation cycle count '${rotationCountRaw}' encountered for string '${targetStringForManipulation}'. Skipping this block and proceeding to next.`);
            // A more robust error handling might skip this string block and continue,
            // but for Type III clone, breaking is closer to the original's implicit behavior on malformed input.
            break;
        }

        // Convert the target string into an array of characters.
        // This alternative representation allows for efficient array-based manipulation (splice, push)
        // which can be more expressive for cyclic shifts than repeated string slicing/concatenation.
        let stringCharacterArray = targetStringForManipulation.split('');

        // Stage 3: Perform individual cyclic shifts based on the provided shift amounts.
        // Loop for the specified number of rotation cycles.
        for (let currentCycle = 0; currentCycle < numberOfRotations; ++currentCycle) {

            // Pre-check: Ensure a shift magnitude token exists for the current rotation cycle.
            if (currentTokenIndex >= dataTokens.length) {
                console.error("Error: Missing shift magnitude for rotation cycle %d of string '%s'. Terminating.", currentCycle + 1, targetStringForManipulation);
                // If a shift amount is missing, we cannot complete the current string's transformations.
                break; // Break out of the inner loop, and then the outer loop will also break.
            }

            // Extract and parse the shift magnitude for the current rotation.
            let shiftMagnitudeRaw = dataTokens[currentTokenIndex++];
            let effectiveShiftMagnitude = Number(shiftMagnitudeRaw);

            // Validate the parsed shift magnitude.
            if (isNaN(effectiveShiftMagnitude) || !Number.isInteger(effectiveShiftMagnitude) || effectiveShiftMagnitude < 0) {
                console.error(`Invalid shift magnitude '${shiftMagnitudeRaw}' for string '${targetStringForManipulation}' cycle ${currentCycle + 1}. Skipping this specific rotation.`);
                continue; // Skip only this rotation, attempt subsequent ones.
            }

            // Optimization and normalization:
            // Ensure the shift magnitude is within the bounds of the string's length.
            // A shift of N characters on a string of length L is equivalent to a shift of N % L.
            effectiveShiftMagnitude %= stringCharacterArray.length;

            // If the effective shift magnitude is zero, no actual rotation is needed for this cycle.
            // This is an optimization fragment to avoid unnecessary array manipulations.
            if (effectiveShiftMagnitude === 0) {
                continue;
            }

            // Perform the cyclic shift using array methods.
            // 'splice(0, effectiveShiftMagnitude)' removes the first 'effectiveShiftMagnitude' characters
            // and returns them as a new array.
            // 'push(...shiftedCharacters)' appends these removed characters to the end of the array.
            let shiftedCharacters = stringCharacterArray.splice(0, effectiveShiftMagnitude);
            stringCharacterArray.push(...shiftedCharacters);
        }

        // Reconstruct the string from the character array after all rotations are applied.
        let finalTransformedString = stringCharacterArray.join('');

        // Output the result to the console.
        console.log(finalTransformedString);
    }
};

// Stage 4: Entry Point and Input Handling.
// This block handles reading the input from standard input and invoking the main processing function.
// Using `const` for module imports and file paths for better code clarity and immutability.
const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin"; // Define the standard input file path.

// Employ a try-catch block to gracefully handle potential file system errors,
// such as the input file not being accessible or issues during reading.
try {
    const fileContents = fileSystemModule.readFileSync(standardInputPath, "utf8");
    ProcessTextualData(fileContents);
} catch (error) {
    // Log a detailed error message if input reading fails.
    console.error(`An error occurred while attempting to read from ${standardInputPath}:`, error.message);
    // Terminate the process with an error code to indicate failure.
    process.exit(1);
}