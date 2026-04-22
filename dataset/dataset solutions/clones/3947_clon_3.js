const extractNumericPairs = (lineOfText) => {
    // Basic validation to ensure we're processing a string
    if (typeof lineOfText !== 'string') {
        // In a robust system, this might throw an error or log more aggressively
        return [];
    }
    // Split the line by spaces and convert each segment to a number
    return lineOfText.split(" ").map(segment => {
        const numericalValue = Number(segment);
        // Optional: Handle cases where a segment might not be a valid number
        if (isNaN(numericalValue)) {
            // Depending on requirements, this could be a default value, error, or skip
            return 0; // Defaulting to zero for invalid numeric strings
        }
        return numericalValue;
    });
};

// Defines a custom comparison logic for sorting the initial set of data points
const comparePrimaryItems = (itemOne, itemTwo) => {
    // Extract coordinates for clarity in comparison
    const [oneX, oneY] = itemOne;
    const [twoX, twoY] = itemTwo;

    // The original sorting rule: if X > Y, compare by Y values; otherwise, compare by X values
    if (oneX > oneY) {
        return oneY - twoY;
    } else {
        return oneX - twoX;
    }
};

// Defines a custom comparison logic for sorting the secondary set of data points
const compareSecondaryItems = (itemOne, itemTwo) => {
    // Extract coordinates for clarity in comparison
    const [oneX, oneY] = itemOne;
    const [twoX, twoY] = itemTwo;

    // The original sorting rule: if X > Y, compare by Y values (inverted); otherwise, compare by X values
    if (oneX > oneY) {
        return twoY - oneY; // Note the inversion compared to primary item sort
    } else {
        return oneX - twoX;
    }
};

/**
 * Core function to process an array of string lines representing numerical data.
 * It identifies and counts specific matching pairs between two collections.
 *
 * @param {string[]} incomingLines An array of strings, where the first string
 *                                 is the count of items, followed by item data.
 */
function processInputData(incomingLines) {
    // Initial validation for the input array's integrity
    if (!Array.isArray(incomingLines) || incomingLines.length === 0) {
        console.error("No input data provided or input is not an array.");
        return; // Exit if input is invalid
    }

    // Parse the total number of elements from the first line
    const totalElementsCount = Number(incomingLines[0]);

    // Handle edge case: zero or invalid element count
    if (isNaN(totalElementsCount) || totalElementsCount <= 0) {
        console.log(0); // If no elements, no matches are possible
        return;
    }

    // Initialize two distinct collections for storing parsed numeric pairs
    const primaryCollection = [];
    const secondaryCollection = [];

    // Iterate through the input lines to populate both collections
    // The original structure of reading both sets in one loop is maintained,
    // but parsing is delegated to a helper function.
    for (let currentLineNum = 1; currentLineNum <= totalElementsCount; currentLineNum++) {
        // Extract and store pairs for the primary collection
        const primaryLineContent = incomingLines[currentLineNum];
        primaryCollection.push(extractNumericPairs(primaryLineContent));

        // Extract and store pairs for the secondary collection
        const secondaryLineContent = incomingLines[currentLineNum + totalElementsCount];
        secondaryCollection.push(extractNumericPairs(secondaryLineContent));
    }

    // Sort both collections using their respective custom comparison functions
    primaryCollection.sort(comparePrimaryItems);
    secondaryCollection.sort(compareSecondaryItems);

    // Initialize pointers for iterating through the sorted collections
    let primaryCollectionPointer = 0;
    let secondaryCollectionPointer = 0;
    // Counter for successfully identified matching pairs
    let successfulMatchCount = 0;

    // Loop until one of the collections has been fully traversed
    while (primaryCollectionPointer < totalElementsCount && secondaryCollectionPointer < totalElementsCount) {
        // Retrieve the current elements being considered from each collection
        const currentPrimaryItem = primaryCollection[primaryCollectionPointer];
        const currentSecondaryItem = secondaryCollection[secondaryCollectionPointer];

        // Introduce descriptive variables for coordinates to enhance readability
        const primaryItemX = currentPrimaryItem[0];
        const primaryItemY = currentPrimaryItem[1];
        const secondaryItemX = currentSecondaryItem[0];
        const secondaryItemY = currentSecondaryItem[1];

        // Determine if the current pair meets the matching criteria
        const canFormValidPair = (primaryItemX < secondaryItemX) && (primaryItemY < secondaryItemY);

        if (canFormValidPair) {
            // If a valid match is found, increment the count and advance both pointers
            successfulMatchCount++;
            primaryCollectionPointer++;
            secondaryCollectionPointer++;
        } else {
            // If no match, only advance the secondary collection's pointer to find a potential match
            secondaryCollectionPointer++;
        }
    }

    // Output the final count of successful pairings to standard output
    console.log(successfulMatchCount);
}

// --- Program Entry Point: Input Reading and Execution ---
// This block handles reading input from standard input and delegates processing.
try {
    // Read the entire content of standard input as a UTF-8 string
    const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Trim whitespace and split the content into an array of lines
    const parsedInputLines = fileContents.trim().split("\n");

    // Invoke the main processing function with the prepared input
    processInputData(parsedInputLines);
} catch (ioError) {
    // Catch and report any errors that occur during file reading or initial processing
    console.error("An error occurred during input handling or data processing:", ioError.message);
    // Optionally, exit the process with an error code
    process.exit(1);
}