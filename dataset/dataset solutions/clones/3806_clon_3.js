function analyzeDataStream(dataPayload) {
    // Begin processing the incoming raw data string.
    // First, split the entire payload into separate lines for easier access.
    const inputLines = dataPayload.split('\n');

    // Extract and parse the length of the numeric sequence from the first line.
    // It's crucial to ensure this is treated as a single integer, not an array.
    const sequenceSizeStr = inputLines[0].trim();
    const sequenceSize = parseInt(sequenceSizeStr.split(' ')[0], 10); // Safely parse the first number

    // Extract and parse the actual numeric sequence from the second line.
    // Each string element is converted to an integer.
    const stringValues = inputLines[1].trim().split(' ');
    const numericSequence = stringValues.map(value => parseInt(value, 10));

    // --- Input Validation Guard Clause ---
    // Perform basic checks to ensure the input data is valid before proceeding.
    if (isNaN(sequenceSize) || sequenceSize <= 0 || numericSequence.length !== sequenceSize) {
        console.error("Data processing halted: Malformed input detected. " +
                      "Expected a positive sequence size matching the number of elements provided.");
        // In a real application, one might throw an error or return a specific status.
        return;
    }

    // Initialize a counter to keep track of subsequences where sum equals XOR sum.
    let validPairCount = 0;

    // --- Core Logic: Iterate through all possible contiguous subsequences ---

    // The outer loop defines the starting index of each potential subsequence.
    // It iterates up to 'sequenceSize - 1' because the inner loop starts at 'outerIdx + 1',
    // ensuring at least two elements for the initial sum/xor calculation as per original logic.
    for (let outerIdx = 0; outerIdx < sequenceSize - 1; ++outerIdx) {
        // For each starting point, initialize the running sum and XOR sum
        // with the value of the element at the current 'outerIdx'.
        let currentAdditiveSum = numericSequence[outerIdx];
        let currentBitwiseXor = numericSequence[outerIdx];

        // The inner loop extends the subsequence by adding subsequent elements.
        // It starts from the element immediately following 'outerIdx'.
        for (let innerIdx = outerIdx + 1; innerIdx < sequenceSize; ++innerIdx) {
            // Fetch the next element to be included in the current subsequence.
            const nextElementValue = numericSequence[innerIdx];

            // Update the running additive sum.
            currentAdditiveSum += nextElementValue;

            // Update the running bitwise XOR sum.
            currentBitwiseXor ^= nextElementValue;

            // Check if the accumulated sum and XOR sum are identical for the current subsequence.
            if (currentAdditiveSum === currentBitwiseXor) {
                validPairCount++; // Increment the counter if the condition is met.
            }
        }
    }

    // --- Final Output Generation ---
    // The final result is a combination of the total count of valid subsequences
    // and the original size of the sequence.
    const computedResult = validPairCount + sequenceSize;

    // Print the computed result to the console.
    console.log(computedResult);
}