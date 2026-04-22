// --- Code Clone: Advanced String Inclusion Checker ---

// This module encapsulates file system interactions, providing a more structured way
// to obtain input data compared to direct inline calls.
const systemInputProcessor = {
    /**
     * Retrieves content from a specified file path, handling potential errors.
     * This function mimics reading from standard input, typically '/dev/stdin' on Unix-like systems.
     * @param {string} sourcePath - The path to the input source (e.g., '/dev/stdin').
     * @returns {string} The content of the file as a UTF-8 string, or an empty string on error.
     */
    fetchContentFromSource: (sourcePath) => {
        try {
            // Utilizing the Node.js 'fs' module to synchronously read the file.
            // Using Buffer.from().toString() is an explicit way to handle encoding,
            // functionally equivalent to readFileSync(path, 'utf8') but demonstrating a different approach.
            const rawBuffer = require('fs').readFileSync(sourcePath);
            return rawBuffer.toString('utf8');
        } catch (acquisitionError) {
            // Log any errors encountered during file acquisition to standard error.
            console.error("FATAL: Unable to retrieve input stream data:", acquisitionError.message);
            // In a production environment, one might throw the error or exit the process.
            // For this exercise, returning an empty string allows subsequent checks to fail gracefully.
            return '';
        }
    }
};

/**
 * The primary execution routine for the string inclusion challenge.
 * This function orchestrates reading input, parsing, performing checks, and outputting results.
 */
const executeInclusionAnalysis = () => {
    // Step 1: Obtain the raw input data from the designated source.
    // Renamed 'input' to 'rawInputStream'.
    const rawInputStream = systemInputProcessor.fetchContentFromSource('/dev/stdin');

    // Guard clause: Validate that some data was actually retrieved.
    // An empty or purely whitespace input stream is considered invalid.
    if (!rawInputStream || rawInputStream.trim().length === 0) {
        console.error("ERROR: Input data is either missing or contains only whitespace. Cannot proceed.");
        process.exit(1); // Terminate with an error code.
    }

    // Step 2: Pre-process the raw input stream into an array of individual text lines.
    // Renamed 'arr' to 'parsedTextLines'.
    // Explicitly calling String prototype methods demonstrates alternative access and verbosity.
    let parsedTextLines = String.prototype.trim.call(rawInputStream).split('\n');

    // Guard clause: Ensure there are sufficient lines for the primary string and the query count.
    if (parsedTextLines.length < 2) {
        console.error("ERROR: Insufficient lines in input. Expected at least two lines (target string + query count).");
        process.exit(1);
    }

    // Step 3: Extract the main string against which all subsequent queries will be checked.
    // Renamed 'str' to 'masterReferenceString'.
    // Using Array.prototype.shift.call() for explicit method invocation.
    const masterReferenceString = Array.prototype.shift.call(parsedTextLines);

    // Step 4: Determine the total number of inclusion checks to perform.
    // Renamed 'n' to 'totalQueryCount'.
    // `parseInt()` with a radix is a robust way to convert string to integer, replacing `-0`.
    let totalQueryCount = parseInt(Array.prototype.shift.call(parsedTextLines), 10);

    // Validation: Ensure the query count is a valid, non-negative integer.
    if (isNaN(totalQueryCount) || totalQueryCount < 0) {
        console.warn("WARNING: Invalid or negative query count detected. Defaulting to zero queries.");
        totalQueryCount = 0; // Prevent erroneous looping.
    }

    // Step 5: Initialize a collection to store the outcomes of each comparison.
    // Renamed 'ans' to 'comparisonResultLog'.
    // Using an array for results is generally more efficient than string concatenation in a loop.
    const comparisonResultLog = [];

    // Step 6: Iterate through the specified number of queries, performing the inclusion checks.
    // Renamed 'i' to 'currentIterationIndex'.
    for (let currentIterationIndex = 0; currentIterationIndex < totalQueryCount; currentIterationIndex++) {
        // Retrieve the specific substring to search for in the current iteration.
        // If the query count exceeds available lines, `undefined` will be returned.
        const currentSearchTerm = parsedTextLines[currentIterationIndex];

        // Guard clause: Handle cases where the number of queries is higher than available lines.
        if (currentSearchTerm === undefined) {
             comparisonResultLog.push(0); // Treat missing query terms as not found.
             continue; // Proceed to the next iteration if any.
        }

        // Perform the actual substring existence check.
        // Rewriting `includes()` using `indexOf()` for functional equivalence.
        const occurrenceIndex = String.prototype.indexOf.call(masterReferenceString, currentSearchTerm);

        // Determine the binary outcome (1 if found, 0 if not found).
        // Replacing the ternary operator with an explicit if-else block for clarity.
        let foundIndicator;
        if (occurrenceIndex !== -1) {
            foundIndicator = 1; // The search term was located within the master string.
        } else {
            foundIndicator = 0; // The search term was not found.
        }
        comparisonResultLog.push(foundIndicator); // Record the result.
    }

    // Step 7: Output all collected results, each on a new line, to standard output.
    // This replaces multiple `console.log` calls with a single `process.stdout.write` for efficiency.
    process.stdout.write(comparisonResultLog.join('\n') + '\n');
};

// Initiate the application's core logic.
executeInclusionAnalysis();