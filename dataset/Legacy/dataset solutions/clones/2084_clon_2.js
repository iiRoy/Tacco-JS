function processInput(inputString) {
    // Initialize a status indicator. By default, assume the input matches the pattern.
    let resultFlag = 'Yes';

    // Ensure the input value is explicitly treated as a string for reliable method calls.
    inputString = String(inputString);

    // Split the string by occurrences of 'hi'. This creates an array of segments
    // that were between or around the 'hi' substrings.
    inputString.split('hi').forEach((segment) => {
        // If any of these segments has a length greater than zero, it means
        // there were characters present that were not part of the 'hi' pattern,
        // or 'hi' was not the only content in the string.
        if (segment.length > 0) {
            // In such a case, the pattern is not fully matched, so update the flag.
            resultFlag = 'No';
        }
    });

    // Display the final determination to the standard output.
    console.log(resultFlag);
}

// Invoke the primary processing function.
// It reads the entire content of standard input, assuming UTF-8 encoding,
// and passes it as the argument.
processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
