(async () => {
    // Configure standard input for UTF-8 encoding
    process.stdin.setEncoding('utf8');

    // Buffer to accumulate all incoming data chunks
    const receivedDataChunks = [];
    for await (const dataSegment of process.stdin) {
        receivedDataChunks.push(dataSegment);
    }

    // Join all chunks to form the complete raw input string
    const completeRawInput = receivedDataChunks.join('');

    // --- Input Validation and Parsing ---
    if (!completeRawInput.trim()) {
        console.error("Error: No input data was provided.");
        return; // Exit if input is empty
    }

    // Split the input into individual lines, handling various newline characters
    // and filtering out any purely empty lines.
    const processedInputLines = completeRawInput.split(/\r?\n/).filter(lineContent => lineContent.trim() !== '');

    if (processedInputLines.length === 0) {
        console.error("Error: Input contains no valid lines after cleaning.");
        return;
    }

    // Parse the first line for array dimensions and query count
    const initialConfigTokens = processedInputLines[0].split(/\s+/);
    if (initialConfigTokens.length < 2) {
        console.error("Error: First line must contain at least two space-separated numbers (array size, query count).");
        return;
    }

    const totalArrayElements = parseInt(initialConfigTokens[0], 10);
    const numberOfOperations = parseInt(initialConfigTokens[1], 10);

    // Validate parsed initial configuration
    if (isNaN(totalArrayElements) || totalArrayElements <= 0) {
        console.error(`Error: Invalid total array elements count: ${totalArrayElements}. Must be a positive integer.`);
        return;
    }
    if (isNaN(numberOfOperations) || numberOfOperations < 0) {
        console.error(`Error: Invalid number of operations: ${numberOfOperations}. Must be a non-negative integer.`);
        return;
    }

    // Parse subsequent lines into an array of operation instructions
    const operationInstructions = [];
    for (let currentLineIndex = 1; currentLineIndex <= numberOfOperations; ++currentLineIndex) {
        if (currentLineIndex >= processedInputLines.length) {
            console.warn(`Warning: Expected ${numberOfOperations} operation lines, but only found ${currentLineIndex - 1}. Stopping query parsing early.`);
            break; // Stop if there are fewer lines than expected operations
        }

        const currentInstructionLine = processedInputLines[currentLineIndex];
        const instructionParts = currentInstructionLine.split(/\s+/).map(part => parseInt(part, 10));

        // Basic validation for each instruction line
        if (instructionParts.length !== 3 || instructionParts.some(isNaN)) {
            console.warn(`Warning: Skipping malformed instruction line (expected 3 numbers): "${currentInstructionLine}"`);
            continue; // Skip to the next line if malformed
        }
        operationInstructions.push(instructionParts);
    }

    // --- Core Logic Initialization ---

    // Initialize the digit storage array 'D' with '1's.
    // This array will hold the current digits of our conceptual number.
    const digitStorage = Array(totalArrayElements).fill(1);

    // Define the prime modulus for all arithmetic operations.
    const primeModulus = 998244353;

    // Calculate the initial aggregated numerical value.
    // This forms a number like 111...1 (totalArrayElements times), modulo primeModulus.
    let currentAggregatedValue = 0;
    for (let elementIterator = 0; elementIterator < totalArrayElements; ++elementIterator) {
        currentAggregatedValue = (currentAggregatedValue * 10) % primeModulus;
        currentAggregatedValue = (currentAggregatedValue + 1) % primeModulus;
    }

    // --- Process Each Operation ---

    // Iterate through each parsed operation instruction.
    for (const currentOperation of operationInstructions) {
        // Destructure operation parameters: [1-based_start, 1-based_end, new_digit_value]
        const [rawStartIndex, rawEndIndex, targetDigitValue] = currentOperation;

        // Convert to 0-based indexing for array access.
        const effectiveStartIndex = rawStartIndex - 1;
        const effectiveEndIndex = rawEndIndex - 1;

        // More robust validation for operation parameters
        if (effectiveStartIndex < 0 || effectiveEndIndex >= totalArrayElements || effectiveStartIndex > effectiveEndIndex || targetDigitValue < 0 || targetDigitValue > 9) {
            console.warn(`Warning: Skipping operation due to invalid parameters: L=${rawStartIndex}, R=${rawEndIndex}, D=${targetDigitValue}.`);
            continue; // Move to the next operation
        }

        // Initialize a variable to accumulate the change (delta) caused by this operation.
        let accumulatedDelta = 0;

        // First pass: Update digits in the specified range [effectiveStartIndex, effectiveEndIndex]
        // and calculate the immediate contribution to the delta.
        for (let digitPos = effectiveStartIndex; digitPos <= effectiveEndIndex; ++digitPos) {
            const previousDigit = digitStorage[digitPos];
            const digitDifference = targetDigitValue - previousDigit;

            // Accumulate the difference, shifted by a power of 10 for its position.
            accumulatedDelta = (accumulatedDelta * 10 + digitDifference) % primeModulus;

            // Update the digit in the storage array.
            digitStorage[digitPos] = targetDigitValue;
        }

        // Second pass: Shift the accumulated delta to its correct positional value.
        // This accounts for the digits to the right of the modified range.
        // The number of positions to shift is totalArrayElements - (effectiveEndIndex + 1).
        const positionsToShift = totalArrayElements - (effectiveEndIndex + 1);
        for (let shiftCount = 0; shiftCount < positionsToShift; ++shiftCount) {
            accumulatedDelta = (accumulatedDelta * 10) % primeModulus;
        }

        // Apply the calculated delta to the main aggregated value.
        currentAggregatedValue = (currentAggregatedValue + accumulatedDelta);

        // Ensure the result remains within the modulo range and is non-negative.
        currentAggregatedValue = (currentAggregatedValue % primeModulus + primeModulus) % primeModulus;

        // Output the current state of the aggregated value.
        console.log(currentAggregatedValue);
    }
})();