function processInputString(rawData) {
    // Validate the incoming data type. If it's not a string or is null,
    // we cannot proceed with string operations.
    if (typeof rawData !== 'string' || rawData === null) {
        // In such cases, the algorithm cannot find any meaningful segments.
        return 0;
    }

    // Normalize the input: remove any leading or trailing whitespace.
    const cleanString = rawData.trim();
    // Cache the length for performance and readability in the loop.
    const stringLength = cleanString.length;

    // A string must have at least two characters (index 0 and index 1)
    // for the loop to even begin processing a segment starting at index 1.
    if (stringLength < 2) {
        return 0;
    }

    // This variable will keep track of the number of unique, consecutive segments identified.
    let uniqueSegmentTally = 0;
    // Stores the last segment that was confirmed as distinct from its predecessor.
    let priorDistinctSegment = "";
    // This variable accumulates characters to form a potential new segment.
    let transientSegmentBuilder = "";

    // Begin iterating through the string from the second character (index 1).
    // The algorithm relies on comparing segments built from this point onwards.
    for (let charCursor = 1; charCursor < stringLength; ++charCursor) {
        // Append the character at the current cursor position to the segment builder.
        // Using charAt() for explicit character retrieval.
        transientSegmentBuilder = transientSegmentBuilder + cleanString.charAt(charCursor);

        // Compare the newly formed 'transientSegmentBuilder' with the 'priorDistinctSegment'.
        if (transientSegmentBuilder === priorDistinctSegment) {
            // If they are identical, it means the current 'transientSegmentBuilder' is
            // a repetition or extension of the last confirmed distinct segment.
            // In this specific logic, we let 'transientSegmentBuilder' continue to grow
            // without resetting it or incrementing the tally.
            continue;
        } else {
            // If the 'transientSegmentBuilder' is different, a new distinct segment
            // has been identified.
            priorDistinctSegment = transientSegmentBuilder; // Update the reference segment.
            transientSegmentBuilder = ""; // Reset the builder to start accumulating a new segment.
            uniqueSegmentTally++; // Increment the count of distinct segments.
        }
    }

    // Return the final tally of unique segments found.
    return uniqueSegmentTally;
}

// Function to safely acquire input data, typically from standard input in Node.js.
function retrieveSourceData() {
    // Check for a Node.js environment where 'fs' module is available.
    if (typeof require === 'function' && typeof module === 'object' && typeof process === 'object') {
        const fileSystemModule = require("fs");
        const defaultInputPath = "/dev/stdin";
        try {
            // Read the entire content of the standard input file, assuming UTF-8 encoding.
            return fileSystemModule.readFileSync(defaultInputPath, "utf8");
        } catch (readError) {
            // Log any errors encountered during file reading and return an empty string
            // to allow the main logic to proceed without crashing.
            console.error("Failed to read from standard input:", readError.message);
            return ""; // Provide a default empty string for robustness.
        }
    } else {
        // This block handles cases where the script is not run in a Node.js environment
        // or 'fs' module is not accessible (e.g., in a web browser).
        console.warn("File system access (fs module) not detected. Returning an empty string as input.");
        return ""; // Return empty string as a fallback.
    }
}

// Acquire the raw input data from the environment.
const rawInputPayload = retrieveSourceData();
// Process the acquired data to calculate the segment count.
const finalCalculatedCount = processInputString(rawInputPayload);
// Output the computed result to the console.
console.log(finalCalculatedCount);