/**
 * Helper function to parse raw input string into an array of lines.
 * Includes basic validation for expected number of lines.
 * @param {string} rawStringData The raw input string, typically from stdin.
 * @returns {string[]} An array of strings, each representing a line of input.
 * @throws {Error} If the input string is empty or does not contain enough lines.
 */
const parseInputLines = (rawStringData) => {
    if (!rawStringData || rawStringData.trim() === '') {
        throw new Error("Input data is empty or invalid.");
    }
    const separatedLines = rawStringData.split('\n');
    // We expect at least 3 lines: N, String1, String2
    if (separatedLines.length < 3) {
        throw new Error("Insufficient lines in input. Expected at least 3 lines (N, stringA, stringB).");
    }
    return separatedLines;
};

/**
 * Orchestrates the solution for the string overlap puzzle.
 * This function processes the input, determines the maximum valid overlap,
 * and prints the resulting merged string.
 * @param {string} rawPuzzleInput The entire input content as a single string.
 */
function ProcessInputData(rawPuzzleInput) {
    let puzzleComponents; // Renamed 'input' to 'puzzleComponents' for clarity after parsing
    try {
        puzzleComponents = parseInputLines(rawPuzzleInput);
    } catch (e) {
        console.error("Error processing input:", e.message);
        // Exit or handle gracefully, depending on requirements. For now, just return.
        return;
    }

    // Extracting the required minimum total length from the first line
    // Using unary plus for type conversion, and providing a default if parsing fails.
    const requiredTotalLength = +(puzzleComponents[0]) || 0;

    // Assigning string segments to more descriptive variable names
    const primarySegment = puzzleComponents[1]; // Corresponds to original input[1]
    const secondarySegment = puzzleComponents[2]; // Corresponds to original input[2]

    // Basic validation for the string segments
    if (typeof primarySegment !== 'string' || typeof secondarySegment !== 'string' || !primarySegment || !secondarySegment) {
        console.error("Missing or invalid string segments from input.");
        return;
    }

    // Pre-calculating lengths for efficiency and readability
    const lenPrimary = primarySegment.length;
    const lenSecondary = secondarySegment.length;

    // Initialize the variable to store the largest valid overlap found
    let effectiveOverlapLength = 0; // Renamed 'ans' to 'effectiveOverlapLength'

    // Determine the maximum possible overlap to start the iteration
    // The overlap cannot be longer than the shorter of the two strings.
    const maxPossibleOverlap = Math.min(lenPrimary, lenSecondary);

    // Iterate downwards from the maximum possible overlap to find the largest valid one.
    // This loop seeks the longest common suffix of primarySegment and prefix of secondarySegment
    // that also satisfies the minimum total length requirement.
    for (let currentCandidate = maxPossibleOverlap; currentCandidate > 0; currentCandidate--) {
        // Extract the potential overlapping parts
        // slice(-N) gets the last N characters (suffix)
        const primarySuffix = primarySegment.slice(-currentCandidate);
        // slice(0, N) gets the first N characters (prefix)
        const secondaryPrefix = secondarySegment.slice(0, currentCandidate);

        // Check if the suffix of the first string matches the prefix of the second
        const isOverlapExact = (primarySuffix === secondaryPrefix);

        // Calculate the length of the strings if merged with this overlap
        // (Length A) + (Length B) - (Overlap)
        const projectedMergedLength = lenPrimary + lenSecondary - currentCandidate;

        // Check if the merged length meets the minimum requirement
        const meetsLengthCriterion = (projectedMergedLength >= requiredTotalLength);

        // If both conditions are met, we've found the largest valid overlap
        if (isOverlapExact && meetsLengthCriterion) {
            effectiveOverlapLength = currentCandidate;
            // No need to check smaller overlaps, as we want the largest.
            break;
        }
    }

    // Construct the final output string.
    // It's the first segment up to the point where overlap starts,
    // concatenated with the full second segment.
    const nonOverlappingPartOfPrimary = primarySegment.slice(0, lenPrimary - effectiveOverlapLength);
    const finalConstructedString = `${nonOverlappingPartOfPrimary}${secondarySegment}`; // Using template literal

    // Output the result to the console.
    console.log(finalConstructedString);
}

// Entry point for execution: Reads from standard input and passes to the main processing function.
// Wrapped in a try-catch block for robust file reading.
try {
    const stdInputContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
    ProcessInputData(stdInputContent);
} catch (error) {
    // This catch block handles errors during file reading or initial input parsing.
    console.error("Failed to read or process standard input:", error.message);
    // Optionally, provide a default or exit.
    process.exit(1); // Exit with a non-zero code to indicate an error.
}