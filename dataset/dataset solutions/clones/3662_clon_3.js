/**
 * Processes raw input data to determine the maximum number of non-overlapping segments.
 * Segments are defined by two numeric values [start, end].
 * The algorithm sorts segments by their end points and then greedily selects
 * the next segment that does not overlap with the previously selected one.
 *
 * @param {string} inputContentString The raw input string, typically from stdin,
 *                                    where each line represents data, and the first line
 *                                    contains overall dimensions (e.g., total elements and number of segments).
 * @returns {number} The count of optimally selected non-overlapping segments.
 */
function determineMaxNonOverlappingSegments(inputContentString) {
    // --- Input Processing and Validation (Type III additions/updates) ---

    if (typeof inputContentString !== 'string' || inputContentString.trim() === '') {
        // Handle empty or invalid input string
        console.error("Error: Provided input is empty or not a string.");
        return 0;
    }

    // Split the input string into individual lines.
    // Filter out any empty lines that might result from extra newlines.
    const rawLines = inputContentString.split('\n').filter(line => line.trim() !== '');

    if (rawLines.length === 0) {
        console.error("Error: No valid data lines found in input.");
        return 0;
    }

    // Parse each line: split by space and convert elements to numbers.
    // Use Number.parseInt for explicit integer conversion.
    // (Type II: Renaming 's' to 'numericDataRows', 'e' to 'itemStr', explicit parseInt)
    const numericDataRows = rawLines.map((lineStr, lineIndex) => {
        const parsedItems = lineStr.split(' ').map(itemStr => {
            const numVal = Number.parseInt(itemStr, 10);
            if (isNaN(numVal)) {
                // Log a warning for malformed numbers but try to continue
                console.warn(`Warning: Non-numeric value '${itemStr}' found on line ${lineIndex + 1}.`);
            }
            return numVal;
        });
        return parsedItems;
    });

    // --- Extracting Dimensions (Type III additions/updates) ---

    // The first line contains overall dimensions: totalElements and numSegmentsExpected.
    // (Type II: Renaming 'n', 'm' to 'totalElements', 'numSegmentsExpected')
    // (Type III: Using destructuring for cleaner assignment, adding validation)
    const [totalElements, numSegmentsExpected] = numericDataRows[0];

    if (isNaN(totalElements) || isNaN(numSegmentsExpected) || totalElements < 0 || numSegmentsExpected < 0) {
        console.error("Error: Invalid dimensions provided in the first line.");
        return 0;
    }

    // --- Segment Data Preparation (Type III additions/updates) ---

    // Extract the actual segment data, starting from the second line.
    // (Type II: Renaming 'a_b' to 'segmentDataPoints')
    // (Type III: Using constants for slice indices for readability)
    const dataStartRowIndex = 1;
    const dataEndRowIndex = numSegmentsExpected + dataStartRowIndex;

    const segmentDataPoints = numericDataRows.slice(dataStartRowIndex, dataEndRowIndex);

    if (segmentDataPoints.length === 0) {
        // No segments to process
        return 0;
    }

    // Sort the segments based on their adjusted end points in ascending order.
    // This is crucial for the greedy interval selection algorithm.
    // (Type II: Renaming variables in sort callback for clarity)
    segmentDataPoints.sort((segmentA, segmentB) => {
        // Ensure segments have at least two elements before accessing index 1
        const endA = Array.isArray(segmentA) && segmentA.length > 1 ? segmentA[1] : Number.MAX_SAFE_INTEGER;
        const endB = Array.isArray(segmentB) && segmentB.length > 1 ? segmentB[1] : Number.MAX_SAFE_INTEGER;
        return endA - endB;
    });

    // --- Core Greedy Algorithm for Interval Selection (Type III refactor) ---

    // Initialize the count of selected non-overlapping segments.
    // (Type II: Renaming 'ans' to 'optimalSegmentCount')
    let optimalSegmentCount = 0;

    // Initialize the boundary of the last selected segment's coverage.
    // Using a very small number ensures the first segment is always selected if valid.
    // The original code implicitly selected the first segment and started with its adjusted end.
    // This refactored approach explicitly selects all segments within the loop.
    // (Type II: Renaming 'end' to 'currentCoverageBoundary')
    // (Type III: Changing initialization from `a_b[0][1]-2` to `Number.MIN_SAFE_INTEGER`
    //            and `ans=1` to `optimalSegmentCount=0` to make selection explicit in loop.)
    let currentCoverageBoundary = Number.MIN_SAFE_INTEGER;

    // Iterate through all sorted segments.
    // (Type II: Renaming 'i' to 'segmentIndex', using `const` for loop variable)
    for (let segmentIndex = 0; segmentIndex < segmentDataPoints.length; segmentIndex++) {
        // (Type III: Introduce a constant for the current segment for readability)
        const currentSegment = segmentDataPoints[segmentIndex];

        // Basic validation for segment structure
        if (!Array.isArray(currentSegment) || currentSegment.length < 2) {
            console.warn(`Warning: Malformed segment data at index ${segmentIndex}. Skipping.`);
            continue;
        }

        // Adjust segment start and end based on problem specific rules (e.g., 0-indexed vs 1-indexed, inclusive/exclusive).
        // (Type III: Introduce constants for adjusted values for clarity)
        const effectiveSegmentStart = currentSegment[0] - 1;
        const effectiveSegmentEnd = currentSegment[1] - 2;

        // Ensure adjusted values are numbers.
        if (isNaN(effectiveSegmentStart) || isNaN(effectiveSegmentEnd)) {
            console.warn(`Warning: Numeric conversion failed for segment at index ${segmentIndex}. Skipping.`);
            continue;
        }

        // If the current segment's effective start is strictly after the current coverage boundary,
        // it means this segment does not overlap with the previously selected ones.
        if (effectiveSegmentStart > currentCoverageBoundary) {
            // Select this segment.
            optimalSegmentCount++;
            // Update the coverage boundary to the effective end of this newly selected segment.
            currentCoverageBoundary = effectiveSegmentEnd;
        }
    }

    // --- Output (Type III update) ---
    // Return the final count instead of directly logging, for better testability and modularity.
    return optimalSegmentCount;
}

// --- Execution Block for Node.js (Type III additions/updates) ---

// This block ensures the code runs only when executed as a script,
// not when imported as a module.
if (require.main === module) {
    const fs = require("fs");
    // Read input from stdin using fs.readFileSync.
    // Using process.stdin.fd for more robust cross-platform stdin reading than '/dev/stdin'.
    try {
        const fileContent = fs.readFileSync(process.stdin.fd, "utf8");
        const result = determineMaxNonOverlappingSegments(fileContent);
        console.log(result);
    } catch (readError) {
        console.error("Failed to read input from stdin:", readError.message);
        // Exit with an error code
        process.exit(1);
    }
}