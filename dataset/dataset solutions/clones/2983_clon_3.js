"use strict";

// Helper function to count occurrences of a specific substring within a larger string.
// This implementation ensures non-overlapping counts.
const identifySubstringOccurrences = (mainString, targetSub) => {
    if (!mainString || !targetSub || targetSub.length === 0) {
        return 0;
    }
    let occurrenceCount = 0;
    let searchStartIndex = 0;
    while ((searchStartIndex = mainString.indexOf(targetSub, searchStartIndex)) !== -1) {
        occurrenceCount++;
        searchStartIndex += targetSub.length; // Move search past the found substring
    }
    return occurrenceCount;
};

/**
 * Analyzes a given multi-line text input to calculate specific string pattern metrics.
 *
 * @param {string} rawInputText The raw string input, potentially containing multiple lines.
 * @returns {number} The final computed metric based on 'AB' occurrences and 'A'/'B' string boundaries.
 */
function ProcessInputData(rawInputText) {
    // Validate the input to ensure it's a non-empty string.
    if (typeof rawInputText !== 'string' || rawInputText.trim().length === 0) {
        console.warn("Received empty or invalid input text. Returning 0.");
        return 0;
    }

    // Split the input text into individual lines (segments).
    const parsedSegments = rawInputText.split('\n');

    // The original code included `N = parseInt(args.shift());` but `N` was not used.
    // As a Type III change, this unused declaration is removed entirely for brevity.

    // Initialize accumulators for various metrics.
    let totalAccumulatedMatches = 0;     // Corresponds to original 'count'
    let segmentsEndingWithA = 0;         // Corresponds to original 'countA'
    let segmentsStartingWithB = 0;       // Corresponds to original 'countB'
    let encounteredBridgeSegment = false; // Corresponds to original 'both'

    // Iterate through each line (segment) to gather required statistics.
    // Using a for...of loop for a different iteration structure compared to forEach.
    for (const currentSegment of parsedSegments) {
        // Skip any empty lines that might result from splitting, as they don't contribute to metrics.
        if (currentSegment.trim().length === 0) {
            continue;
        }

        // Type III: Rewriting the 'AB' count logic using the helper function.
        // This replaces the string replacement and length calculation with an explicit loop.
        totalAccumulatedMatches += identifySubstringOccurrences(currentSegment, 'AB');

        // Type II: Renaming internal variables for clarity and using modern string methods.
        const segmentBeginsWithB = currentSegment.startsWith('B');
        const segmentEndsWithA = currentSegment.endsWith('A');

        // Increment respective counters based on segment characteristics.
        if (segmentBeginsWithB) {
            segmentsStartingWithB++;
        }
        if (segmentEndsWithA) {
            segmentsEndingWithA++;
        }

        // Type III: Explicitly checking and updating the flag for a 'B...A' segment.
        if (segmentBeginsWithB && segmentEndsWithA) {
            encounteredBridgeSegment = true;
        }
    }

    // Perform final adjustments to the total accumulated matches.
    // Type III: Using Math.min for a clearer expression of finding the minimum.
    totalAccumulatedMatches += Math.min(segmentsEndingWithA, segmentsStartingWithB);

    // Type III: Rewriting the conditional subtraction using an 'if' statement
    // instead of a ternary operator for potentially better readability in this context.
    if (encounteredBridgeSegment) {
        totalAccumulatedMatches--; // Decrement if at least one segment started with 'B' and ended with 'A'.
    }

    // Return the final calculated result.
    return totalAccumulatedMatches;
}

// Wrapper function to abstract away environment-specific input reading.
const obtainExternalInput = () => {
    try {
        // This line is specific to typical competitive programming environments in Node.js.
        return require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (error) {
        console.error("Error reading input from /dev/stdin:", error);
        // In a real application, you might want to handle this more robustly,
        // e.g., by returning a default value or re-throwing a custom error.
        return "";
    }
};

// Main execution block: retrieve input, process it, and display the result.
const finalComputedValue = ProcessInputData(obtainExternalInput());
console.log(finalComputedValue);