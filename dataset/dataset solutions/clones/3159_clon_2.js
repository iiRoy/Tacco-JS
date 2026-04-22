// Function to analyze an input character sequence for specific patterns.
function ProcessSequence(rawText) {
    // Convert the raw input string into an array of individual characters.
    // This allows for easier manipulation and removal of elements during processing.
    let charArray = rawText.split("");


    // Initialize a flag to control the main processing loop.
    // This flag will be set to 'true' if any modifications occur in a pass,
    // indicating that another pass is needed.
    let wasModifiedInPass = true;

    // Initialize a counter to keep track of the number of matched character pairs found.
    // This count will be used to calculate the final result.
    let totalMatches = 0;


    // Outer loop: Continues as long as modifications are being made within the character sequence.
    // If an entire pass through the sequence completes without any changes, the loop terminates.
    while (wasModifiedInPass) {
        // Reset the modification flag at the beginning of each outer loop iteration.
        // We assume no modifications will occur until one actually does.
        wasModifiedInPass = false;

        // Inner loop: Iterates through the character array to find and process target patterns.
        // The loop condition uses 'charArray.length' which can change dynamically due to splicing.
        for (let currentIdx = 0; currentIdx < charArray.length; currentIdx++) {
            // Debugging output: Displays the current state of the character array at each step.
            console.log(charArray);

            // Check for the first specific pattern: a "1" character immediately followed by a "0".
            // We also ensure that 'currentIdx + 1' is a valid index to prevent errors.
            if (charArray[currentIdx] === "1" &&
                charArray[currentIdx + 1] === "0")
            {
                // Increment the counter for successfully identified pairs.
                totalMatches++;
                // Set the flag to true, indicating that a modification has occurred in this pass.
                wasModifiedInPass = true;
                // Remove the two matched characters from the array starting at the current index.
                charArray.splice(currentIdx, 2);
            }

            // Check for the second specific pattern: a "0" character immediately followed by a "1".
            // This check is performed independently and might be affected by the previous splice operation
            // if it occurred at the same 'currentIdx'.
            if (charArray[currentIdx] === "0" &&
                charArray[currentIdx + 1] === "1")
            {
                // Increment the counter for successfully identified pairs.
                totalMatches++;
                // Set the flag to true, indicating that a modification has occurred in this pass.
                wasModifiedInPass = true;
                // Remove the two matched characters from the array.
                charArray.splice(currentIdx, 2);
            }
        }

        // If no modifications were made during the entire inner loop pass (i.e., 'wasModifiedInPass' is still false),
        // it signifies that no more patterns can be found, so we exit the outer processing loop.
        if (!wasModifiedInPass) break;
    }

    // Output the final computed result: the total number of matched pairs multiplied by two.
    console.log(totalMatches * 2);
}

// Entry point for execution: Reads input from standard input and passes it to the processing function.
// This line assumes a Node.js environment where 'fs' module is available for file system operations.
ProcessSequence(require("fs").readFileSync("/dev/stdin", "utf8"));