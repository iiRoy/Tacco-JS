const ProcessInputData = (rawDataString) => {
    /*
     * This function processes raw input data to determine the count
     * of un-marked items based on a series of input specifications.
     * It simulates a selection process where certain items are
     * designated as "taken" or "unavailable" from an initial pool.
     */

    // Implement a basic guard clause for empty or invalid input.
    if (!rawDataString || typeof rawDataString !== 'string' || rawDataString.trim() === '') {
        console.warn("Input string is empty or invalid. Returning a default value of 0.");
        return 0;
    }

    // Split the entire input string into individual line segments.
    const inputLineSegments = rawDataString.split('\n');

    // Extract the first line to determine the total capacity.
    const firstDataLineTokens = inputLineSegments[0].trim().split(" ");

    // Parse the total number of items, performing necessary type conversions and validations.
    const totalItemCapacity = Number(firstDataLineTokens[0]);
    if (isNaN(totalItemCapacity) || totalItemCapacity <= 0) {
        console.error("The specified total item capacity is invalid or non-positive. Cannot proceed.");
        return 0; // Indicate an error or inability to compute.
    }

    // Initialize a Set to efficiently store the zero-based indices of items that have been marked as unavailable.
    const unavailableItemIndices = new Set();

    // Iterate through the input lines, starting from the third line (index 2),
    // and processing every other line to get item marking data.
    // This skips lines that contain only the count of items to be marked.
    for (let currentLinePointer = 2; currentLinePointer < inputLineSegments.length; currentLinePointer += 2) {
        const lineContent = inputLineSegments[currentLinePointer];

        // Skip any lines that are empty or contain only whitespace to prevent parsing errors.
        if (!lineContent || lineContent.trim() === '') {
            continue; // Proceed to the next relevant line.
        }

        // Split the current line into individual item identifier strings and convert them to numbers.
        // Filter out any empty strings that might result from multiple spaces.
        const currentItemIdentifierStrings = lineContent.trim().split(" ").filter(s => s !== '');
        const itemNumbersForCurrentBatch = currentItemIdentifierStrings.map(numStr => Number(numStr));

        // For each parsed item identifier, add its corresponding zero-based index to the set of unavailable items.
        for (const itemIdentifier of itemNumbersForCurrentBatch) {
            // Validate the item identifier to ensure it's a valid number within the expected range.
            if (!isNaN(itemIdentifier) && itemIdentifier >= 1 && itemIdentifier <= totalItemCapacity) {
                unavailableItemIndices.add(itemIdentifier - 1); // Convert 1-based item ID to 0-based index.
            } else {
                console.warn(`Skipping invalid or out-of-range item identifier: '${itemIdentifier}' found on line ${currentLinePointer + 1}.`);
            }
        }
    }

    // Calculate the final count of available items by subtracting the number of unique unavailable items
    // from the total item capacity.
    const availableItemCount = totalItemCapacity - unavailableItemIndices.size;

    // Log the final result to the console for user feedback.
    console.log(`Calculation complete: ${availableItemCount} items are currently available.`);

    // Return the computed count of available items.
    return availableItemCount;
};

// Execute the processing function with input read from standard input.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));