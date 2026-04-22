// Helper function to send messages to the standard output device.
function logToConsole(messageData) {
    console.log(messageData);
}

/**
 * Executes a structural analysis on a provided numerical sequence.
 * This routine validates specific properties of element frequencies and sequence length
 * to determine if it fits a predetermined pattern, then computes a derived value.
 * @param {string} rawSourceInput The complete string input, typically from stdin.
 */
function processSequenceValidation(rawSourceInput) {
    // --- Initial Input Handling and Robustness Checks ---
    if (!rawSourceInput || rawSourceInput.trim().length === 0) {
        logToConsole("0"); // Output '0' for empty or invalid input string.
        return;
    }

    const cleanedInputText = rawSourceInput.trim();
    const inputSegmentArray = cleanedInputText.split('\n');

    // Ensure we have at least two lines for length and data.
    if (inputSegmentArray.length < 2) {
        logToConsole("0"); // Insufficient data provided.
        return;
    }

    // A small utility for reliable integer parsing.
    const safeParseInt = (strValue) => {
        const parsedNum = parseInt(strValue.trim(), 10);
        if (isNaN(parsedNum)) {
            throw new Error(`Invalid numeric format encountered: "${strValue}"`);
        }
        return parsedNum;
    };

    let declaredSequenceLength;
    try {
        declaredSequenceLength = safeParseInt(inputSegmentArray[0]);
    } catch (parseError) {
        logToConsole("0"); // Could not interpret the sequence length.
        return;
    }

    // The sequence must contain a positive number of elements.
    if (declaredSequenceLength <= 0) {
        logToConsole("0"); // Sequence length must be greater than zero.
        return;
    }

    let numericalElementsList;
    try {
        numericalElementsList = inputSegmentArray[1].split(' ').map(valStr => safeParseInt(valStr));
    } catch (parseError) {
        logToConsole("0"); // Problem parsing the actual data points.
        return;
    }

    // Verify that the number of parsed elements matches the declared length.
    if (numericalElementsList.length !== declaredSequenceLength) {
        logToConsole("0"); // Discrepancy between declared and actual element count.
        return;
    }

    // --- Step 2: Calculate Frequencies of Each Element ---
    // Utilizing a Map for efficient storage and retrieval of element counts.
    const elementOccurrenceMap = new Map();
    for (const currentElement of numericalElementsList) {
        elementOccurrenceMap.set(currentElement, (elementOccurrenceMap.get(currentElement) || 0) + 1);
    }

    // --- Step 3: Identify and Sort Unique Elements ---
    // Convert to a Set to obtain unique values, then back to an array for sorting.
    let uniqueSortedValues = Array.from(new Set(numericalElementsList)).sort((a, b) => a - b);

    // --- Step 4: Apply Structural Validation Rules ---
    let isStructureCoherent = true; // Flag to track overall validity.

    // Rule for odd-length sequences: A single '0' must be present as the central element.
    if (declaredSequenceLength % 2 !== 0) {
        if (!elementOccurrenceMap.has(0) || elementOccurrenceMap.get(0) !== 1) {
            isStructureCoherent = false; // '0' is missing or has incorrect frequency.
        } else {
            // Remove '0' from the unique list, as its special condition is met.
            uniqueSortedValues = uniqueSortedValues.filter(item => item !== 0);
        }
    } else { // Rule for even-length sequences: '0' should not appear as a singular central element.
        // If '0' is present, it must occur exactly twice, like any other paired element.
        if (elementOccurrenceMap.has(0) && elementOccurrenceMap.get(0) !== 2) {
            isStructureCoherent = false; // '0' is present but not as a pair.
        }
    }

    // If the structure is still coherent, proceed with general element frequency checks.
    if (isStructureCoherent) {
        for (const distinctItem of uniqueSortedValues) {
            // All remaining distinct elements (excluding the specially handled '0' for odd lengths)
            // must appear exactly twice to form valid pairs.
            if (elementOccurrenceMap.get(distinctItem) !== 2) {
                isStructureCoherent = false; // An element does not form a pair.
                break; // No need to check further, structure is broken.
            }
        }
    }

    // --- Step 5: Compute Final Outcome and Display ---
    if (isStructureCoherent) {
        // The final result is 2 raised to the power of the number of unique pairs.
        // 'uniqueSortedValues.length' now represents the count of such pairs.
        const numberOfPairs = uniqueSortedValues.length;
        const finalCalculatedResult = Math.pow(2, numberOfPairs);
        logToConsole(finalCalculatedResult);
    } else {
        logToConsole("0"); // The sequence does not conform to the expected structure.
    }
}

// Invoke the main processing function with data read from standard input.
processSequenceValidation(require("fs").readFileSync("/dev/stdin", "utf8"));