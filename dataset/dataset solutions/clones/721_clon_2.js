const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8'); // Retrieve raw content from standard input.

const dataLines = (sourceContent.trim()) // Remove any leading or trailing whitespace from the full input.
                     .split("\n"); // Segment the cleaned input into an array of lines.

// Begin iterating through each distinct line obtained from the input.
for (let lineCount = 0; lineCount < dataLines.length; lineCount++) {
    // Assign the current line from the array to a temporary variable for processing.
    let currentSequence = dataLines[lineCount];

    // First transformation: Eliminate all alphabetical characters (both uppercase and lowercase),
    // periods, and any form of whitespace from the line.
    currentSequence = currentSequence.replace(/[a-zA-Z]|\.|\s/g, "");

    // Loop continuously to remove perfectly matched "[]" or "()" pairs.
    // This process repeats until no further such pairs can be found in the string.
    while (currentSequence.match(/\[\]|\(\)/)) {
        currentSequence = currentSequence.replace(/\[\]|\(\)/g, "");
    }

    // After all processing, check if the string is entirely empty.
    // Output "yes" if it is, indicating successful balancing/removal; otherwise, output "no".
    console.log((currentSequence === "") ? "yes" : "no");
}