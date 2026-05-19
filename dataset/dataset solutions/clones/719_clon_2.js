function calculateSequenceSum(inputVal) {
    // Initialize variables for sequence generation
    let counterA = 0;
    let currentNumA = 1;
    let stepIncA = 1;
    let innerIncA = 1;

    // Array to store generated sequence values
    const sequenceValsA = [];
    sequenceValsA.push(0); // Add initial zero

    // Generate sequence until currentNumA exceeds inputVal
    while (currentNumA <= inputVal) {
        counterA++; // Increment the count of sequence elements
        sequenceValsA.push(currentNumA); // Store the current sequence number
        innerIncA++; // Increment inner increment
        stepIncA += innerIncA; // Update step increment
        currentNumA += stepIncA; // Update current sequence number
    }

    // Dynamic programming table initialization
    const memoTableA = [];
    memoTableA[0] = [];
    memoTableA[0][0] = 0; // Base case for DP

    // Initialize rows for the DP table (using a modulo 5 approach for space optimization)
    for (let rowIdxA = 1; rowIdxA < 5; rowIdxA++) {
        memoTableA[rowIdxA] = [];
    }

    // Initialize the first row of the DP table with a large value
    for (let colIdxA = 1; colIdxA <= inputVal; colIdxA++) {
        memoTableA[0][colIdxA] = 1000000000; // Represents infinity
    }

    // Fill the DP table
    for (let iterCountA = 1; iterCountA <= counterA; iterCountA++) {
        const outerLoopIdxA = iterCountA % 5; // Current row index (modulo 5)
        let prevRowIdxA = outerLoopIdxA - 1; // Previous row index

        // Handle wrap-around for previous row index
        if (prevRowIdxA < 0) {
            prevRowIdxA = 4;
        }

        // Iterate through all possible target sums
        for (let colIdxA = 0; colIdxA <= inputVal; colIdxA++) {
            // If the current sequence value is greater than the target sum
            if (colIdxA < sequenceValsA[outerLoopIdxA]) {
                memoTableA[outerLoopIdxA][colIdxA] = memoTableA[prevRowIdxA][colIdxA];
            } else {
                // Apply the DP transition: take min of not including or including the current value
                memoTableA[outerLoopIdxA][colIdxA] = memoTableA[prevRowIdxA][colIdxA] < memoTableA[outerLoopIdxA][colIdxA - sequenceValsA[outerLoopIdxA]] + 1
                    ? memoTableA[prevRowIdxA][colIdxA]
                    : memoTableA[outerLoopIdxA][colIdxA - sequenceValsA[outerLoopIdxA]] + 1;
            }
        }
    }

    // Get the final result from the DP table
    counterA %= 5; // Adjust final row index
    return memoTableA[counterA][inputVal];
}


function processOddSequence(inputParam) {
    // Variables for sequence generation, similar to the first function
    let counterB = 0;
    let currentNumB = 1;
    let stepIncB = 1;
    let innerIncB = 1;

    // Array to hold generated odd sequence values
    const oddSequenceValsB = [];
    oddSequenceValsB.push(0); // Initial element

    // Generate sequence, but only store odd numbers
    while (currentNumB <= inputParam) {
        if (currentNumB % 2) { // Check if the number is odd
            counterB++; // Increment count for odd numbers
            oddSequenceValsB.push(currentNumB); // Store the odd number
        }
        innerIncB++; // Update increments
        stepIncB += innerIncB;
        currentNumB += stepIncB;
    }

    // Dynamic programming table setup
    const memoTableB = [];
    memoTableB[0] = [];
    memoTableB[0][0] = 0; // Base case

    // Initialize DP table rows
    for (let rowIdxB = 1; rowIdxB < 5; rowIdxB++) {
        memoTableB[rowIdxB] = [];
    }

    // Initialize the first row with a large value
    for (let colIdxB = 1; colIdxB <= inputParam; colIdxB++) {
        memoTableB[0][colIdxB] = 1000000000; // Represents infinity
    }

    // Populate the DP table
    for (let iterCountB = 1; iterCountB <= counterB; iterCountB++) {
        const outerLoopIdxB = iterCountB % 5; // Current row index
        let prevRowIdxB = outerLoopIdxB - 1; // Previous row index

        // Handle negative index wrap-around
        if (prevRowIdxB < 0) {
            prevRowIdxB = 4;
        }

        // Iterate through target sums
        for (let colIdxB = 0; colIdxB <= inputParam; colIdxB++) {
            // If current odd sequence value is too large for the target sum
            if (colIdxB < oddSequenceValsB[outerLoopIdxB]) {
                memoTableB[outerLoopIdxB][colIdxB] = memoTableB[prevRowIdxB][colIdxB];
            } else {
                // DP transition logic
                memoTableB[outerLoopIdxB][colIdxB] = memoTableB[prevRowIdxB][colIdxB] < memoTableB[outerLoopIdxB][colIdxB - oddSequenceValsB[outerLoopIdxB]] + 1
                    ? memoTableB[prevRowIdxB][colIdxB]
                    : memoTableB[outerLoopIdxB][colIdxB - oddSequenceValsB[outerLoopIdxB]] + 1;
            }
        }
    }

    // Final result retrieval
    counterB %= 5; // Adjust final row index
    return memoTableB[counterB][inputParam];
}

// Main execution function
function ExecuteProgram(rawData) {
    const lines = rawData.split("\n"); // Split input by newline

    let lineIndex = 0;
    while (true) { // Infinite loop, breaks on specific condition
        const parsedNum = parseInt(lines[lineIndex], 10); // Parse integer from current line
        if (parsedNum === 0) { // If parsed number is 0, terminate
            break;
        }
        // Output results from both functions
        console.log(calculateSequenceSum(parsedNum), processOddSequence(parsedNum));
        lineIndex++; // Move to the next line
    }
}

// Read input from standard input and pass to the main function
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
