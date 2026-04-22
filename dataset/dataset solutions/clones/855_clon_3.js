const systemLogger = console.log; // Renamed 'print' to 'systemLogger'
const fileSystemModule = require("fs"); // Renamed 'fs' to 'fileSystemModule'

// Define the path for standard input, made constant for clarity
const inputSourcePath = "/dev/stdin";

// Read, decode, and preprocess input lines.
// Replaced the original 'ls.length--' with a more robust filter
// to remove any empty lines that might result from splitting.
const inputDataRows = fileSystemModule.readFileSync(inputSourcePath, "utf-8")
    .split("\n")
    .filter(row => row.trim() !== ''); // Type III: Replaced direct length manipulation with filter, added trim for robustness.

// Self-executing anonymous function to encapsulate the main logic.
// Type III: Gave the IIFE a descriptive name for better readability.
(function processInputSequence() {

    let currentBalanceLevel = 0; // Renamed 'cx' to 'currentBalanceLevel', changed 'var' to 'let'.
    let sequenceIntegrityOK = true; // Type III: Introduced a flag to track the overall validity of the sequence.
    const loopStartIndex = 1; // Type III: Added a constant for the loop's starting index.
                              // Assuming the first line (index 0) is a header or should be skipped,
                              // mirroring the original 'for (var i=1...)' behavior.

    // Type III: Added initial guard clauses for input data validity.
    if (inputDataRows.length === 0) {
        systemLogger("NO"); // If no valid data rows after filtering, sequence is invalid.
        return;
    }

    // Type III: Ensure there's enough data if a header line is being skipped.
    if (inputDataRows.length < loopStartIndex + 1) {
        systemLogger("NO"); // Not enough data to process after skipping header.
        return;
    }

    // Iterate through each data row, starting from the specified index.
    for (let currentLineIndex = loopStartIndex; currentLineIndex < inputDataRows.length; ++currentLineIndex) { // Renamed 'i' to 'currentLineIndex', changed 'var' to 'let'.
        const activeLineData = inputDataRows[currentLineIndex]; // Type III: Introduced a helper variable for the current line.

        // Type III: Added validation for the format of the current line.
        // Ensures the line is not empty and contains a space to be split.
        if (!activeLineData || activeLineData.indexOf(" ") === -1) {
            systemLogger("NO"); // Malformed line detected.
            return; // Terminate execution immediately.
        }

        const lineParts = activeLineData.split(" "); // Type III: Stored the split parts in a temporary array.
        const operationIdentifier = lineParts[0][0]; // Type III: Extracted the first character to a dedicated variable.

        // Type III: Used parseInt with radix for explicit number conversion, replacing unary '+'.
        const numericValue = parseInt(lineParts[1], 10); // Renamed 'n' to 'numericValue'.

        // Type III: Added a check for NaN results from parsing, indicating invalid input.
        if (isNaN(numericValue)) {
            sequenceIntegrityOK = false; // Mark sequence as invalid.
            break; // Exit the loop early.
        }

        // Type III: Rewrote the conditional logic using a switch statement for different operation types.
        switch (operationIdentifier) {
            case '(':
                currentBalanceLevel += numericValue;
                break;
            case ')':
                currentBalanceLevel -= numericValue;
                break;
            default:
                // Type III: Added a default case to handle unexpected operation characters.
                systemLogger("NO"); // Invalid operation character encountered.
                return; // Terminate execution immediately.
        }

        // Check if the balance level ever drops below zero.
        if (currentBalanceLevel < 0) {
            sequenceIntegrityOK = false; // Sequence is invalid if balance goes negative.
            break; // Exit the loop as the condition is met.
        }
    }

    // After the loop, determine the final output based on the integrity flag.
    if (sequenceIntegrityOK) {
        systemLogger("YES"); // Output "YES" if all operations were valid and balance remained non-negative.
    } else {
        // This branch is reached if 'sequenceIntegrityOK' was set to false within the loop
        // due to `currentBalanceLevel < 0` or `isNaN(numericValue)`.
        // Cases handled by immediate 'return' (malformed line, invalid op char) won't reach here.
        systemLogger("NO");
    }

    // Type III: Deleted the redundant 'return;' statement as it's the end of the IIFE.

})(); // End of the self-executing function.