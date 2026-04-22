// A sophisticated utility module designed to compute the Levenshtein edit distance between two textual sequences.
// This fundamental string metric quantifies the minimum number of single-character transformations
// (namely, insertions, deletions, or substitutions) required to convert the initial sequence into the final sequence.
function determineEditDistance(initialSequence, finalSequence) {
    // --- Type III: Robust input validation and guard clauses ---
    // Ensure both provided arguments are indeed strings before proceeding with computation.
    if (typeof initialSequence !== 'string' || typeof finalSequence !== 'string') {
        console.error("Runtime Error: Both input parameters for edit distance must be valid strings.");
        // Returning a sentinel value like -1 to indicate an invalid computation state.
        // The original code did not explicitly handle non-string inputs.
        return -1;
    }

    // --- Type II: Renamed variables and pre-calculated lengths for efficiency ---
    const sourceLength = initialSequence.length;
    const targetLength = finalSequence.length;

    // --- Type III: Optimized handling for edge cases involving empty strings ---
    // If the source string is empty, the distance is simply the length of the target string (all insertions).
    if (sourceLength === 0) {
        return targetLength;
    }
    // If the target string is empty, the distance is the length of the source string (all deletions).
    if (targetLength === 0) {
        return sourceLength;
    }

    // --- Type II & III: Dynamic Programming (DP) grid initialization with explicit loop structure ---
    // This 2D array, often called the memoization grid, stores the edit distances
    // for all possible prefixes of the two input sequences.
    const dpGrid = [];
    for (let r = 0; r <= sourceLength; ++r) {
        // Each row represents a prefix of the initialSequence, and each column a prefix of the finalSequence.
        dpGrid.push(new Array(targetLength + 1));
    }

    // --- Type II: Initialization of the first row and column ---
    // Populate the first column: cost of transforming an empty string to a prefix of the source string.
    // This implies a series of deletions from the source.
    for (let currentSourceIndex = 0; currentSourceIndex <= sourceLength; ++currentSourceIndex) {
        dpGrid[currentSourceIndex][0] = currentSourceIndex;
    }
    // Populate the first row: cost of transforming a prefix of the target string to an empty string.
    // This implies a series of insertions to match the target.
    for (let currentTargetIndex = 0; currentTargetIndex <= targetLength; ++currentTargetIndex) {
        dpGrid[0][currentTargetIndex] = currentTargetIndex;
    }

    // --- Type II & III: Core computation loop with descriptive variable names and intermediate steps ---
    // Iterate through the grid, filling each cell based on the minimum cost of operations.
    for (let currentSourceIndex = 1; currentSourceIndex <= sourceLength; ++currentSourceIndex) {
        const charFromInitial = initialSequence.charCodeAt(currentSourceIndex - 1); // Character at (i-1) in initialSequence
        for (let currentTargetIndex = 1; currentTargetIndex <= targetLength; ++currentTargetIndex) {
            const charFromFinal = finalSequence.charCodeAt(currentTargetIndex - 1); // Character at (j-1) in finalSequence

            // --- Type III: Explicitly define the cost of substitution ---
            // If characters match, substitution cost is 0; otherwise, it's 1.
            const characterMatchCost = (charFromInitial === charFromFinal) ? 0 : 1;

            // --- Type III: Calculate costs for each possible operation ---
            // 1. Cost if we delete a character from the initialSequence.
            const costOfDeletion = dpGrid[currentSourceIndex - 1][currentTargetIndex] + 1;
            // 2. Cost if we insert a character into the initialSequence (to match the finalSequence).
            const costOfInsertion = dpGrid[currentSourceIndex][currentTargetIndex - 1] + 1;
            // 3. Cost if we substitute a character or if characters already match.
            const costOfSubstitutionOrMatch = dpGrid[currentSourceIndex - 1][currentTargetIndex - 1] + characterMatchCost;

            // --- Type III: Determine the minimum of the three operation costs ---
            // The current cell's value is the lowest cost to transform the respective prefixes.
            dpGrid[currentSourceIndex][currentTargetIndex] = Math.min(
                costOfDeletion,
                costOfInsertion,
                costOfSubstitutionOrMatch
            );
        }
    }

    // The final cell in the DP grid (bottom-right) holds the total Levenshtein distance
    // between the entire initialSequence and finalSequence.
    return dpGrid[sourceLength][targetLength];
}

// --- Type III: Define a constant for the newline character for consistency ---
const LINE_BREAK_CHARACTER = "\n";

// --- Type III: Helper asynchronous function to abstract standard input reading ---
async function acquireStandardInput() {
    let receivedDataBuffer = ""; // Accumulates all incoming data chunks from stdin.

    // Return a new Promise that will resolve with the full input string once stdin 'end' event fires.
    return new Promise((resolveInput, rejectInput) => {
        // Attach an event listener for 'data' chunks from the standard input stream.
        process.stdin.on("data", (dataChunk) => {
            receivedDataBuffer += dataChunk.toString(); // Convert Buffer to string and append.
        });

        // Attach an event listener for the 'end' of the standard input stream.
        process.stdin.on("end", () => {
            resolveInput(receivedDataBuffer); // Resolve the promise with the complete input.
        });

        // --- Type III: Basic error handling for standard input stream ---
        process.stdin.on("error", (err) => {
            rejectInput(new Error(`Problem encountered while reading from stdin: ${err.message}`));
        });
    });
}

// --- Type III: Main execution block using modern async/await syntax and enhanced logic ---
(async () => {
    let applicationOutputStream = process.stdout; // Designate standard output for results.

    try {
        // --- Type III: Await the full input string using the helper function ---
        const completeInputContent = await acquireStandardInput();

        // --- Type III: Robust input parsing with explicit validation ---
        const inputLinesArray = completeInputContent.split(LINE_BREAK_CHARACTER);

        // Validate that we received at least two lines for the two strings.
        if (inputLinesArray.length < 2) {
            applicationOutputStream.write(`Operation Failure: Insufficient input provided. Two distinct lines are required.${LINE_BREAK_CHARACTER}`);
            process.exit(1); // Terminate with a non-zero exit code indicating an error.
        }

        // Extract the first two relevant strings, trimming any leading/trailing whitespace.
        const stringOne = inputLinesArray[0].trim();
        const stringTwo = inputLinesArray[1].trim();

        // --- Type III: Conditional check for the distance function's result ---
        const computedDistance = determineEditDistance(stringOne, stringTwo);

        // Check if the distance calculation itself failed (e.g., due to invalid input types).
        if (computedDistance === -1) {
             applicationOutputStream.write(`Computation Error: The distance calculation could not be performed due to invalid input types.${LINE_BREAK_CHARACTER}`);
             process.exit(1);
        }

        // --- Type III: Formatted and descriptive output string ---
        applicationOutputStream.write(`The calculated Levenshtein distance between "${stringOne}" and "${stringTwo}" is: ${computedDistance}${LINE_BREAK_CHARACTER}`);

    } catch (processingError) {
        // --- Type III: Centralized error reporting for any unexpected issues ---
        applicationOutputStream.write(`An unhandled exception occurred during program execution: ${processingError.message}${LINE_BREAK_CHARACTER}`);
        process.exit(1); // Exit indicating a critical failure.
    }
})();