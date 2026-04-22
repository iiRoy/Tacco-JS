// Main entry point for processing multiple data sets.
function processDataSets() {
    // Loop continuously to handle multiple test cases until a termination condition is met.
    while (true) {
        // Read the total number of elements for the current data set.
        // This value often signals the end of input if it's zero.
        const totalElementsCount = getNextNumericInput();

        // Termination condition: if the element count is zero, exit the processing loop.
        if (totalElementsCount === 0) {
            break;
        }

        // Read the desired size of the sliding window.
        const slidingWindowSize = getNextNumericInput();

        // --- Input Validation and Edge Case Handling ---
        // If the window size is non-positive, or larger than the total elements,
        // or if there are no elements, the maximum sum is effectively zero.
        if (slidingWindowSize <= 0 || totalElementsCount <= 0 || slidingWindowSize > totalElementsCount) {
            outputResult(0);
            continue; // Skip to the next data set.
        }

        // Initialize an array to store the numeric values for the current data set.
        const numericValuesArray = new Array(totalElementsCount);
        // Populate the array by reading 'totalElementsCount' numbers from the input.
        for (let i = 0; i < totalElementsCount; ++i) {
            numericValuesArray[i] = getNextNumericInput();
        }

        // --- Calculate the sum of the initial window ---
        let currentWindowSumValue = 0;
        // Iterate through the first 'slidingWindowSize' elements to get the initial sum.
        for (let i = 0; i < slidingWindowSize; ++i) {
            currentWindowSumValue += numericValuesArray[i];
        }

        // Initialize the variable to store the maximum sum found so far with the initial window's sum.
        let maximumWindowSumFound = currentWindowSumValue;

        // --- Perform the sliding window operation ---
        // The loop will run 'totalElementsCount - slidingWindowSize' times.
        // Each iteration slides the window one position to the right.
        const numberOfSlides = totalElementsCount - slidingWindowSize;

        for (let slideIndex = 0; slideIndex < numberOfSlides; ++slideIndex) {
            // Subtract the element that is leaving the window (oldest element).
            currentWindowSumValue -= numericValuesArray[slideIndex];
            // Add the new element that is entering the window (newest element).
            currentWindowSumValue += numericValuesArray[slidingWindowSize + slideIndex];

            // Update the maximum sum if the current window's sum is greater.
            if (currentWindowSumValue > maximumWindowSumFound) {
                maximumWindowSumFound = currentWindowSumValue;
            }
        }

        // Output the final maximum sum found for the current data set.
        outputResult(maximumWindowSumFound);
    }
}

// Helper function to read the next numeric token from the pre-processed input array.
// Includes basic validation for numeric conversion.
function getNextNumericInput() {
    // Check if there are tokens left to process.
    if (currentTokenPointer >= tokenizedInputArray.length) {
        // In a real scenario, this might throw an error or handle end-of-input differently.
        // For competitive programming, usually input is guaranteed to be well-formed.
        return 0; // Or some other default/error value.
    }
    const tokenString = tokenizedInputArray[currentTokenPointer++];
    const numericValue = Number(tokenString);

    // Basic validation: if the conversion results in NaN, return 0 or re-prompt/error.
    // For this problem, assuming valid numeric input.
    if (isNaN(numericValue)) {
        // console.error(`Warning: Input token '${tokenString}' is not a valid number.`);
        return 0; // Return 0 or handle as an error.
    }
    return numericValue;
}

// Helper function to display results to the console.
function outputResult(valueToDisplay) {
    console.log(valueToDisplay);
}

// --- Standard Node.js input handling setup ---
process.stdin.resume(); // Keep the process alive for input.
process.stdin.setEncoding('utf8'); // Set encoding for input stream.

let inputBufferString = ''; // Buffer to accumulate all incoming data chunks.
let tokenizedInputArray = []; // Array to store input tokens after splitting.
let currentTokenPointer = 0; // Pointer to the current token being read from tokenizedInputArray.

// Event listener for incoming data chunks.
process.stdin.on('data', function(dataChunk) {
    inputBufferString += dataChunk; // Append each chunk to the buffer.
});

// Event listener for the end of the input stream.
process.stdin.on('end', function() {
    // Split the accumulated input string by whitespace characters.
    // .filter(Boolean) removes any empty strings that might result from multiple spaces.
    tokenizedInputArray = inputBufferString.split(/\s+/).filter(Boolean);
    // Once all input is received and processed into tokens, start the main program logic.
    processDataSets();
});