function computePrimaryValues(targetValue) {
    // This function calculates a minimum number of elements to form 'targetValue'
    // using a specific sequence of numbers.

    let iterationCounter = 0; // Tracks the number of sequence terms generated
    let currentSequenceA = 1; // First term in the sequence generation logic
    let currentSequenceB = 1; // Second term in the sequence generation logic
    let currentSequenceC = 1; // Third term in the sequence generation logic
    
    // Array to store the generated sequence terms (including an initial zero)
    const generatedTerms = [];
    generatedTerms.push(0); 

    // Generate the sequence: A, B, C are updated in a specific pattern
    while (currentSequenceA <= targetValue) {
        iterationCounter++;
        generatedTerms.push(currentSequenceA);
        currentSequenceC++;
        currentSequenceB += currentSequenceC;
        currentSequenceA += currentSequenceB;
    }

    // Initialize a 2D array for dynamic programming (DP table)
    let memoizationArray = [];
    memoizationArray[0] = [];
    memoizationArray[0][0] = 0; // Base case: 0 elements needed to form 0

    // Prepare rows for the DP table (using a fixed size of 5 for modulo arithmetic)
    for (let outerLoopIndex = 1; outerLoopIndex < 5; outerLoopIndex++)
        memoizationArray[outerLoopIndex] = [];
    
    // Initialize the first row of the DP table with a very large number,
    // representing an unreachable state or infinity, for all values > 0.
    for (let outerLoopIndex = 1; outerLoopIndex <= targetValue; outerLoopIndex++) {
        memoizationArray[0][outerLoopIndex] = 1000000000;
    }

    // Main loop for filling the dynamic programming table
    for (let fullLoopIndex = 1; fullLoopIndex <= iterationCounter; fullLoopIndex++) {
        let currentRowIndex = fullLoopIndex % 5; // Current row index, uses modulo 5 for circular buffer
        let previousRowIndex = currentRowIndex - 1; // Index of the previous row in the circular buffer
        
        // Adjust previousRowIndex if it becomes negative
        if (previousRowIndex < 0) {
            previousRowIndex = 4;
        }

        // Iterate through each column (sum value) for the current row
        for (let currentColIndex = 0; currentColIndex <= targetValue; currentColIndex++) {
            // If the current sum 'currentColIndex' is less than the current sequence term,
            // we cannot use the current term, so copy the value from the previous row.
            if (currentColIndex < generatedTerms[currentRowIndex]) {
                memoizationArray[currentRowIndex][currentColIndex] = memoizationArray[previousRowIndex][currentColIndex];
            }
            // Otherwise, we have two choices:
            // 1. Don't use the current term (value from previous row).
            // 2. Use the current term (value from current row minus term + 1).
            // Pick the minimum of these two options.
            else {
                memoizationArray[currentRowIndex][currentColIndex] =
                    memoizationArray[previousRowIndex][currentColIndex] <
                    memoizationArray[currentRowIndex][currentColIndex - generatedTerms[currentRowIndex]] + 1
                        ? memoizationArray[previousRowIndex][currentColIndex]
                        : memoizationArray[currentRowIndex][currentColIndex - generatedTerms[currentRowIndex]] + 1;
            }
        }
    }

    // Final adjustment of the iteration counter for retrieving the result
    iterationCounter %= 5;

    // Return the computed minimum count for 'targetValue'
    return memoizationArray[iterationCounter][targetValue];
}



function computeFilteredValues(desiredNumber) {
    // This function is similar to the first, but it only considers odd numbers
    // from the generated sequence for the dynamic programming calculation.

    let oddCount = 0; // Counts the number of odd sequence terms found
    let seqTermA = 1; // First variable in the sequence generation
    let seqTermB = 1; // Second variable in the sequence generation
    let seqTermC = 1; // Third variable in the sequence generation
    
    // Array to store only the odd terms from the sequence, plus an initial zero
    const filteredTerms = [];
    filteredTerms.push(0);

    // Generate the sequence and filter for odd numbers
    while (seqTermA <= desiredNumber) {
        // Check if the current term 'seqTermA' is odd
        if (seqTermA % 2) {
            oddCount++; // Increment the counter for odd terms
            filteredTerms.push(seqTermA); // Add the odd term to the filtered list
        }
        seqTermC++;
        seqTermB += seqTermC;
        seqTermA += seqTermB;
    }

    // Initialize the dynamic programming table
    let dpArray = [];
    dpArray[0] = [];
    dpArray[0][0] = 0; // Base case: 0 elements for sum 0

    // Prepare rows for the DP table (circular buffer of size 5)
    for (let outerIdx = 1; outerIdx < 5; outerIdx++)
        dpArray[outerIdx] = [];
    
    // Initialize the first row of the DP table with a large value (infinity)
    for (let outerIdx = 1; outerIdx <= desiredNumber; outerIdx++) {
        dpArray[0][outerIdx] = 1000000000;
    }

    // Main dynamic programming loop
    for (let majorIteration = 1; majorIteration <= oddCount; majorIteration++) {
        let currentRowIdx = majorIteration % 5; // Current row index (circular)
        let precedingIndex = currentRowIdx - 1; // Index of the previous row
        
        // Handle negative index for the circular buffer
        if (precedingIndex < 0)
            precedingIndex = 4;
        
        // Iterate through each column (sum value)
        for (let innerIdx = 0; innerIdx <= desiredNumber; innerIdx++) {
            // Decision logic: if current sum is less than the current odd term,
            // we cannot use the term, so copy from the previous row.
            if (innerIdx < filteredTerms[currentRowIdx]) {
                dpArray[currentRowIdx][innerIdx] = dpArray[precedingIndex][innerIdx];
            }
            // Otherwise, choose the minimum between:
            // 1. Not using the current odd term (value from previous row).
            // 2. Using the current odd term (value from current row for remaining sum + 1).
            else {
                dpArray[currentRowIdx][innerIdx] =
                    dpArray[precedingIndex][innerIdx] <
                    dpArray[currentRowIdx][innerIdx - filteredTerms[currentRowIdx]] + 1
                        ? dpArray[precedingIndex][innerIdx]
                        : dpArray[currentRowIdx][innerIdx - filteredTerms[currentRowIdx]] + 1;
            }
        }
    }

    // Final adjustment of the odd count for result lookup
    oddCount %= 5;

    // Return the calculated minimum count for 'desiredNumber' using only odd terms
    return dpArray[oddCount][desiredNumber];
}

// Main entry point for processing input from a file
function ProcessInputData(receivedInput) {
    // Split the input string by newlines to get an array of lines
    receivedInput = receivedInput.split("\n");

    // Loop through each line of input indefinitely until a specific condition is met
    for (let lineIndex = 0; ; lineIndex++) {
        // Parse the current line as an integer
        let parsedNumber = parseInt(receivedInput[lineIndex], 10);
        
        // If the parsed number is 0, it signifies the end of input, so break the loop
        if (parsedNumber === 0)
            break;
        
        // Log the results of both calculation functions for the current number
        console.log(computePrimaryValues(parsedNumber), computeFilteredValues(parsedNumber));
    }
    
}

// Read input from standard input (e.g., from a file via redirection)
// and then pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));