process.stdin.resume(); // Ensure the standard input stream remains open
process.stdin.setEncoding('utf8'); // Configure input to use UTF-8 character encoding

// A dynamic buffer to accumulate all input lines received
let incomingInputLines = [];

// Establish a readline interface to manage input and output streams
const streamInputProcessor = require('readline').createInterface({
  input: process.stdin,  // Use standard input as the source
  output: process.stdout // Standard output (though not used for direct interaction in this problem)
});

// Register an event listener for each line of input received
streamInputProcessor.on('line', (currentLineData) => {
  incomingInputLines.push(currentLineData); // Add the parsed line to our buffer
});

// Register an event listener for when the input stream concludes (e.g., EOF)
streamInputProcessor.on('close', () => {
    // --- Utility Function for BigInt Absolute Value (Type III Addition) ---
    // JavaScript's BigInt type does not natively include an .abs() method.
    // This helper provides that functionality for BigInts.
    const obtainBigIntAbsoluteValue = (numberValue) => {
        return numberValue < 0n ? -numberValue : numberValue;
    };

    // --- Robust Input Handling and Validation (Type III Additions) ---
    if (incomingInputLines.length === 0) {
        // Guard clause for scenarios with no input provided
        console.error("Error: No input data detected. Please provide N and K values.");
        return;
    }

    const firstInputEntry = incomingInputLines[0];
    const numericStringComponents = firstInputEntry.split(" ");

    if (numericStringComponents.length < 2) {
        // Guard clause for insufficient input parameters
        console.error("Error: Expected two numerical values (N and K), but received fewer.");
        return;
    }

    let evolvingNumericValue; // Represents 'N' in the original problem context
    let fixedDivisorValue;    // Represents 'K' in the original problem context

    try {
        evolvingNumericValue = BigInt(numericStringComponents[0]);
        fixedDivisorValue = BigInt(numericStringComponents[1]);
    } catch (parsingError) {
        // Catch potential errors during BigInt conversion
        console.error("Input Parsing Error: Unable to convert provided strings to BigInts.", parsingError.message);
        return;
    }

    // --- Specific Edge Case Handling for Divisor (Type III Addition) ---
    if (fixedDivisorValue === 0n) {
        // Division by zero is mathematically undefined for modulo operations.
        // In this context, if K is 0, N%K is problematic.
        // A common interpretation is that if K=0, the sequence cannot progress meaningfully
        // via N%K. If N is 0, the result is 0. If N is non-zero, N%0 is undefined.
        // For simplicity and to avoid runtime errors, handle this as a special case.
        // If N=0 and K=0, the result is 0. If N!=0 and K=0, the operations (N%K, abs(K-(N%K))) are ill-defined.
        // The problem typically implies K > 0. If K is 0, the value N cannot change if N%0 is N, and abs(0-N) is N.
        // Thus, N itself would be the minimum.
        console.log(evolvingNumericValue === 0n ? "0" : evolvingNumericValue.toString());
        return;
    }

    // --- Core Logic Variables Re-initialization and Renaming ---
    // Utilizing a Set for efficient tracking of encountered BigInt remainders.
    // BigInt values are converted to strings for reliable storage as Set elements.
    const previouslyEncounteredRemainders = new Set();
    let currentMinimumResult = evolvingNumericValue; // Initialize the minimum with the starting N

    // --- Primary Calculation Loop for Sequence Transformation ---
    // The loop continues as long as the current 'evolvingNumericValue' has not
    // matched any of the 'remainderCandidate' values stored in our tracking Set.
    while (!previouslyEncounteredRemainders.has(evolvingNumericValue.toString())) {
        const remainderCandidate = evolvingNumericValue % fixedDivisorValue; // Compute the current remainder

        // Record this remainder in our set to detect future cycles
        previouslyEncounteredRemainders.add(remainderCandidate.toString());

        // Update the overall minimum result if the current remainder is smaller
        if (remainderCandidate < currentMinimumResult) {
            currentMinimumResult = remainderCandidate;
        }

        // Early exit optimization: if 0 is found, it's the smallest possible non-negative
        // value, so further iterations are unnecessary.
        if (currentMinimumResult === 0n) {
            break;
        }

        // Apply the transformation rule to 'evolvingNumericValue' for the next iteration:
        // N_new = abs(K - (N_old % K))
        // Using our custom BigInt absolute value helper function for clarity.
        evolvingNumericValue = obtainBigIntAbsoluteValue(fixedDivisorValue - remainderCandidate);
    }

    // Output the final determined minimum result
    console.log(currentMinimumResult.toString());
});

// --- Additional Event Handler (Type III Addition) ---
// This listener can be used for cleanup or final logging when the process exits.
process.on('exit', () => {
  // Any final resource release or status reporting could go here.
  // For this specific problem, it's not strictly necessary but demonstrates
  // an added structural change.
});