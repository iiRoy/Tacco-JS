const analyzeStringRelationship = (rawInputText) => {
    // This function evaluates if the initial string provided in the input
    // acts as a prefix for the subsequent string within the same input.
    // It processes raw textual data, performs validation, and then executes a comparison.

    // Step 1: Divide the monolithic input string into an array of individual lines.
    // The expectation is that each distinct piece of data resides on its own line.
    const inputSegments = rawInputText.split('\n');

    // Type III Addition: Robust input validation to ensure the minimum required lines are present.
    // If the input doesn't contain at least two lines, the core logic cannot proceed meaningfully.
    if (inputSegments.length < 2) {
        console.log("No"); // Default to 'No' for malformed input to prevent errors
        return;
    }

    // Step 2: Extract and clean the primary strings for comparison from the parsed segments.
    // The first line is designated as the 'candidate' prefix. Whitespace is removed for cleaner comparison.
    const prefixCandidateString = inputSegments[0].trim();
    // The second line serves as the 'target' string against which the prefix is checked.
    const mainTargetSequence = inputSegments[1].trim();

    // Type III Addition: Comprehensive guard clauses to handle various edge cases involving empty strings.
    // Case 1: Both strings are empty. An empty string is a prefix of itself.
    if (prefixCandidateString.length === 0 && mainTargetSequence.length === 0) {
        console.log("Yes");
        return;
    }
    // Case 2: The prefix candidate is empty, but the target sequence is not. An empty string is a prefix of any string.
    if (prefixCandidateString.length === 0 && mainTargetSequence.length > 0) {
        console.log("Yes");
        return;
    }
    // Case 3: The prefix candidate is non-empty, but the target sequence is empty. A non-empty string cannot prefix an empty one.
    if (prefixCandidateString.length > 0 && mainTargetSequence.length === 0) {
        console.log("No");
        return;
    }

    // Step 3: Determine the exact length of the prefix candidate.
    // This value is crucial for extracting the corresponding segment from the target string.
    const requiredSegmentLength = prefixCandidateString.length;

    // Type III Addition: Early termination condition if the target string is too short.
    // If the main target sequence is shorter than the prefix candidate, a match is impossible.
    if (mainTargetSequence.length < requiredSegmentLength) {
        console.log("No");
        return;
    }

    // Step 4: Extract the initial segment from the target string, matching the length of the prefix candidate.
    // Utilizing `slice()` is a modern and recommended approach for substring extraction in JavaScript.
    // Type III Update: Replaced `substr()` with `slice()` for improved consistency and modern practice.
    const extractedTargetSegment = mainTargetSequence.slice(0, requiredSegmentLength);

    // Step 5: Perform the core comparison using strict equality.
    // This ensures both the value and the type of the strings are identical for a true match.
    // Type III Addition: Introduction of an explicit boolean variable for clarity of the comparison result.
    const isPrefixActuallyPresent = (prefixCandidateString === extractedTargetSegment);

    // Step 6: Output the final determination based on the comparison result.
    // Type III Update: Condensed the `if-else` statement into a more succinct ternary operator.
    console.log(isPrefixActuallyPresent ? "Yes" : "No");
};

// Main execution pathway:
// This block is responsible for reading the program's input from the standard input stream
// and then initiating the string analysis process.
try {
    // Type III Update: Encapsulate the input reading operation into a clearly named constant.
    const fileSystemInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Invoke the primary analysis function with the content retrieved from standard input.
    analyzeStringRelationship(fileSystemInputContent);
} catch (inputOperationError) {
    // Type III Addition: Robust error handling for potential issues during file system operations.
    // If reading from stdin fails for any reason, an error message is logged, and a default 'No' is output.
    console.error("An issue occurred while attempting to read from standard input:", inputOperationError.message);
    console.log("No"); // Provide a default output in case of critical input failure.
}