const processInputData = (inputPayload) => {
    // Initialize processing environment
    const cleanedPayload = inputPayload.trim();
    const payloadLines = cleanedPayload.split("\n");

    // --- Input Validation and Parsing ---
    // Ensure there are at least two lines for N and the array elements
    if (payloadLines.length < 2) {
        console.error("Error: Insufficient input data provided. Expected at least two lines.");
        return; // Exit if input is malformed
    }

    // Parse the total number of elements specified on the first line
    const declaredElementCountStr = payloadLines[0].split(" ")[0];
    const declaredElementCount = parseInt(declaredElementCountStr, 10);

    // Parse the sequence of numbers from the second line
    let numericSequence = payloadLines[1].split(" ").map(valueString => parseInt(valueString, 10));
    
    // Filter out any non-numeric values that might result from parsing errors
    numericSequence = numericSequence.filter(num => !isNaN(num));

    // Align the effective element count with the actual number of successfully parsed elements
    const actualElementCount = numericSequence.length;

    // --- Data Preparation ---
    // Sort the numeric sequence in ascending order, which is crucial for the algorithm
    numericSequence.sort((valA, valB) => valA - valB);

    // --- Helper Functions for Element Management ---
    // Defines the sentinel value used to mark elements for removal
    const REMOVED_SENTINEL = -1;

    // Marks an element at a given index in the array as 'removed'
    const markElementAsRemoved = (arrayRef, indexToMark) => {
        if (indexToMark >= 0 && indexToMark < arrayRef.length) {
            arrayRef[indexToMark] = REMOVED_SENTINEL;
        }
    };

    // Checks if a given value is marked as 'removed'
    const isElementMarked = (valueToCheck) => valueToCheck === REMOVED_SENTINEL;

    // --- Core Algorithm Logic ---
    let currentProcessingIndex = 0; // Primary pointer for iterating through the sorted sequence

    // Main loop: Continues as long as the primary pointer is within bounds
    while (currentProcessingIndex < actualElementCount) {
        // If the current element has already been marked for removal, skip it and advance
        if (isElementMarked(numericSequence[currentProcessingIndex])) {
            currentProcessingIndex++;
            continue;
        }

        const currentPrimaryValue = numericSequence[currentProcessingIndex];

        let hasDuplicateOccurred = false; // Flag to track if the currentPrimaryValue has duplicates
        let nextPotentialStartIdx = -1; // Stores the index of the first element not divisible by currentPrimaryValue

        // Inner loop: Compares the current primary value with all subsequent elements
        for (let secondaryScanIndex = currentProcessingIndex + 1; secondaryScanIndex < actualElementCount; secondaryScanIndex++) {
            // Skip elements in the secondary scan that are already marked for removal
            if (isElementMarked(numericSequence[secondaryScanIndex])) {
                continue;
            }

            const secondaryValue = numericSequence[secondaryScanIndex];

            // Check if the secondary value is a duplicate of the primary value
            if (secondaryValue === currentPrimaryValue) {
                hasDuplicateOccurred = true;
            }

            // If the secondary value is a multiple of the primary value, mark it for removal
            if (secondaryValue % currentPrimaryValue === 0) {
                markElementAsRemoved(numericSequence, secondaryScanIndex);
            } else {
                // If it's not a multiple, and we haven't yet determined the next potential start index, record it
                if (nextPotentialStartIdx === -1) {
                    nextPotentialStartIdx = secondaryScanIndex;
                }
            }
        }

        // After the inner loop, if duplicates were found for the current primary value, mark it too
        if (hasDuplicateOccurred) {
            markElementAsRemoved(numericSequence, currentProcessingIndex);
        }

        // Adjust the primary processing index for the next iteration
        if (nextPotentialStartIdx !== -1) {
            currentProcessingIndex = nextPotentialStartIdx; // Jump to the first non-multiple found
        } else {
            currentProcessingIndex++; // Otherwise, just move to the next sequential element
        }
    }

    // --- Final Result Calculation ---
    // Filter out all elements that were marked for removal and count the remaining ones
    const finalRetainedElements = numericSequence.filter(val => !isElementMarked(val));
    console.log(finalRetainedElements.length);
};

// Entry point for execution: Read input from standard input
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));