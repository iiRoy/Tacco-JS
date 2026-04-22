/**
 * Orchestrates the processing of an array of raw input strings.
 * It identifies a specific terminator string ("0 0") and then iterates through
 * the preceding lines, reordering two space-separated numbers on each line
 * such that the smaller number always comes first. Lines after the terminator
 * are disregarded. If the terminator is not found, no output is generated.
 *
 * @param {string[]} rawData - An array where each element is a string representing a line of input.
 */
function processInputLines(rawData) {
    // Define the special string that marks the end of the data block to be processed.
    const dataBlockTerminator = '0 0';
    let boundaryIndex = -1; // This will store the array index of the terminator.

    // Manually search for the terminator string. This replaces a single call to `indexOf`
    // with a more explicit loop, allowing for additional logic or debugging if needed.
    let currentScanPosition = 0;
    while (currentScanPosition < rawData.length) {
        if (rawData[currentScanPosition] === dataBlockTerminator) {
            boundaryIndex = currentScanPosition;
            break; // Terminator located, exit the search loop.
        }
        currentScanPosition++;
    }

    // Implement a guard clause: If the terminator was never found,
    // it implies no valid data block is present. In this case,
    // we output nothing and terminate execution of this function.
    if (boundaryIndex === -1) {
        console.log(""); // Output an empty string to signify no data processed.
        return;
    }

    // Initialize an array to accumulate the results after processing each individual line.
    const collatedResults = [];

    /**
     * Internal helper function responsible for parsing, validating, and potentially
     * reordering numbers within a single input string line.
     *
     * @param {string} lineSegment - A single string line, expected to contain two space-separated numbers.
     * @returns {string} The processed line with numbers sorted (smaller first), or the original line if invalid.
     */
    const parseAndNormalizeNumericLine = (lineSegment) => {
        // Basic validation: skip processing for empty or whitespace-only lines.
        if (!lineSegment || lineSegment.trim() === '') {
            return ''; // Return an empty string for effectively empty lines.
        }

        // Split the line into its constituent parts based on a space delimiter.
        const components = lineSegment.split(' ');

        // Validate that we have at least two components to attempt parsing.
        if (components.length < 2) {
            // If the line is malformed (e.g., only one number or no numbers), return it as is.
            return lineSegment;
        }

        // Convert the string components into actual numeric values.
        // Using `Number()` constructor for type conversion, which handles various formats.
        const primaryNumericValue = Number(components[0]);
        const secondaryNumericValue = Number(components[1]);

        // Further validation: check if the conversions resulted in actual numbers.
        if (isNaN(primaryNumericValue) || isNaN(secondaryNumericValue)) {
            // If either value is not a valid number, the line cannot be processed numerically.
            return lineSegment; // Return the original line without modification.
        }

        // Compare the two numbers and construct the output string using template literals.
        // This ensures the smaller number is always presented first.
        if (secondaryNumericValue < primaryNumericValue) {
            // If the second value is smaller, swap their order in the output string.
            return `${secondaryNumericValue} ${primaryNumericValue}`;
        } else {
            // Otherwise, maintain their original relative order.
            return `${primaryNumericValue} ${secondaryNumericValue}`;
        }
    };

    // Iterate through each relevant line of the raw input data,
    // from the beginning up to (but not including) the terminator's position.
    for (let currentLineIterator = 0; currentLineIterator < boundaryIndex; currentLineIterator++) {
        const lineToProcess = rawData[currentLineIterator]; // Retrieve the current line.
        const normalizedLine = parseAndNormalizeNumericLine(lineToProcess); // Process it using our helper.
        collatedResults.push(normalizedLine); // Add the processed line to our collection.
    }

    // Join all the processed lines together with newline characters to form the final output string.
    const finalFormattedOutput = collatedResults.join('\n');
    console.log(finalFormattedOutput); // Display the final result.
}