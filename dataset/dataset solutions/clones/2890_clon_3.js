// This module processes an incoming data stream.
// It extracts the primary content line and performs a specific character filtering operation.
// Finally, it evaluates the length of the filtered content against a predefined threshold.
function analyzeInputPayload(rawPayload) {
    // Ensure the input payload is a string before proceeding.
    if (typeof rawPayload !== 'string' || rawPayload.trim().length === 0) {
        // In a real application, this might throw an error or return a default.
        // For this context, we'll just log an informative message and exit.
        console.error("Error: Input payload is empty or not a string.");
        return;
    }

    // Split the entire payload into individual lines based on newline characters.
    const contentLines = rawPayload.split('\n');

    // Define the numeric threshold for the length check.
    const LENGTH_THRESHOLD = 8;

    // Retrieve the very first line from the parsed input.
    // If no lines exist, handle gracefully to prevent errors.
    const primaryContentLine = contentLines.length > 0 ? contentLines[0] : "";

    // A temporary array to accumulate characters that pass the filter.
    let filteredCharacters = [];

    // Iterate through each character of the primary content line.
    // Exclude any occurrences of the lowercase 'o' character.
    for (let charIndex = 0; charIndex < primaryContentLine.length; charIndex++) {
        const currentChar = primaryContentLine[charIndex];
        if (currentChar !== 'o') {
            filteredCharacters.push(currentChar);
        }
    }

    // Reconstruct the string from the filtered characters.
    const processedString = filteredCharacters.join('');

    // Determine if the length of the processed string meets the criteria.
    // If its length is less than the threshold, it is considered a success.
    const isLengthAcceptable = processedString.length < LENGTH_THRESHOLD;

    // Based on the evaluation, prepare the final output message.
    const outcomeMessage = isLengthAcceptable ? "YES" : "NO";

    // Display the final result to the standard output.
    console.log(outcomeMessage);
}

// The following section handles reading input from standard I/O and invoking the primary processing function.
// This part is generally left untouched in competitive programming contexts to ensure compatibility.
analyzeInputPayload(require("fs").readFileSync("/dev/stdin", "utf8"));