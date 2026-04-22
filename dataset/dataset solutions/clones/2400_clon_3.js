function processInputData(rawInputText) {
    // This function takes raw string input, parses it, and calculates a specific count
    // based on subsequence sums and a given divisor.

    // 1. Input Validation and Initial Parsing
    // ----------------------------------------
    // Check if the provided input is empty or just whitespace.
    if (!rawInputText || rawInputText.trim().length === 0) {
        console.error("Error: Input data is empty or invalid. Cannot proceed with analysis.");
        return 0; // Return zero as no valid sequences can be found.
    }

    // Split the input into individual lines for easier processing.
    const inputLines = rawInputText.trim().split('\n');

    // Ensure that we have at least two lines: one for configuration (N, K) and one for numbers.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines provided. Expected at least two lines.");
        return 0;
    }

    // 2. Parse Configuration Parameters (Divisor K)
    // ---------------------------------------------
    // Extract tokens from the first line, which contains N and K.
    const configurationTokens = inputLines[0].split(' ');

    // The original 'N' (expected array size) was parsed but never utilized.
    // For a Type III clone, we can either remove it entirely or add a check.
    // Here, we choose to remove it for brevity and to demonstrate deletion of unused code.
    // const expectedNumericElementCount = parseInt(configurationTokens[0], 10);

    // Parse the modulo divisor (K).
    const moduloDivisorValue = parseInt(configurationTokens[1], 10);

    // Validate the parsed divisor. It must be a positive integer.
    if (isNaN(moduloDivisorValue) || moduloDivisorValue <= 0) {
        console.error(`Error: Invalid or non-positive modulo divisor '${configurationTokens[1]}' provided. Aborting.`);
        return 0;
    }

    // 3. Parse the Numeric Sequence
    // -----------------------------
    // Split the second line into strings, representing individual numbers.
    const stringNumbers = inputLines[1].split(' ');

    // Convert string representations to actual integers, filtering out any non-numeric entries.
    const numericDataSet = stringNumbers.map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));

    // Check if any valid numbers were successfully parsed.
    if (numericDataSet.length === 0) {
        console.warn("Warning: No valid numeric elements found in the input sequence. Result will be zero.");
        return 0;
    }

    // 4. Core Logic: Subsequence Sum Analysis
    // ---------------------------------------
    let qualifyingSubsequenceCounter = 0; // Renamed from 'ans'

    // Iterate through each possible starting position for a subsequence.
    for (let currentStartingIndex = 0; currentStartingIndex < numericDataSet.length; currentStartingIndex++) {
        // Store the value of the element at the current starting index for clarity.
        const firstElementOfSubsequence = numericDataSet[currentStartingIndex];

        // Initialize the running sum for the current subsequence.
        let currentRunningSum = firstElementOfSubsequence;
        // Initialize the length of the current subsequence.
        let actualSubsequenceLength = 1;

        // Check the condition for a single-element subsequence.
        // Original: if (nums[i] % K === 1) ans++;
        if ((firstElementOfSubsequence % moduloDivisorValue) === actualSubsequenceLength) {
            qualifyingSubsequenceCounter++;
            // console.debug(`Match found for single element at index ${currentStartingIndex}.`); // Example of added debug/intermediate step.
        }

        // Extend the subsequence by adding subsequent elements.
        // Original inner loop: for (var j = 1; j < nums.length - i; j++)
        for (let extensionOffset = 1; (currentStartingIndex + extensionOffset) < numericDataSet.length; extensionOffset++) {
            // Add the next element to the running sum.
            currentRunningSum += numericDataSet[currentStartingIndex + extensionOffset];
            // Increment the length of the subsequence.
            actualSubsequenceLength++;

            // Define the required remainder explicitly for readability.
            const targetRemainder = actualSubsequenceLength;

            // Check the condition for the extended subsequence.
            // Original: if (tmp % K === j + 1) ans++;
            if ((currentRunningSum % moduloDivisorValue) === targetRemainder) {
                qualifyingSubsequenceCounter++;
                // console.debug(`Match found for subsequence from index ${currentStartingIndex} with length ${actualSubsequenceLength}.`); // Another intermediate step.
            }
        }
    }

    // 5. Final Output
    // ---------------
    // Log the final count of qualifying subsequences to standard output.
    console.log(qualifyingSubsequenceCounter);

    // Return the calculated count. This makes the function more testable and reusable.
    return qualifyingSubsequenceCounter;
}

// 6. Execution Block for Standard Input
// -------------------------------------
// This block ensures the function is called when the script is executed directly
// and handles reading from standard input.
if (typeof require !== 'undefined' && require.main === module) {
    try {
        // Attempt to load the 'fs' (file system) module for reading input.
        const fileSystemModule = require('fs');
        // Read all data from standard input ('/dev/stdin') as a UTF-8 string.
        const standardInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
        // Call the main processing function with the obtained input.
        processInputData(standardInputData);
    } catch (ioError) {
        // Catch and report any errors that occur during file reading or processing.
        console.error("An error occurred during input processing:", ioError.message);
        // Optionally, exit the process with an error code.
        // process.exit(1);
    }
}