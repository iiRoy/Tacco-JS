function ProcessSequence(charSequence) {
    // Convert the incoming string into an array of characters.
    // This allows for easy manipulation like splicing.
    let currentSequence = charSequence.split("");

    // A boolean flag to track if any matching pairs were found during an iteration
    // of the inner loop. It's initialized to true at the start of each outer loop pass.
    let noMoreMatches = true;

    // This variable will accumulate the count of successfully removed "10" or "01" pairs.
    let matchCount = 0;

    // The main processing loop. It continues indefinitely until no more pairs can be found.
    while (true) {
        // Reset the flag for the current pass. If no pairs are found in the upcoming
        // inner loop, this flag will remain true, causing the outer loop to terminate.
        noMoreMatches = true;

        // Iterate through the character array to find and remove "10" or "01" pairs.
        // The loop condition `idx < currentSequence.length` is re-evaluated in each iteration,
        // which is important because `splice` modifies the array length.
        for (let idx = 0; idx < currentSequence.length; idx++) {
            // Output the current state of the sequence. This is a critical part of the observable behavior.
            console.log(currentSequence);

            // Check for the "10" pattern at the current index and the next.
            if (currentSequence[idx] === "1" && currentSequence[idx + 1] === "0") {
                matchCount++; // Increment the counter for found pairs.
                noMoreMatches = false; // A match was found, so the outer loop should continue.
                // Remove the two matched characters from the array.
                // Note: The loop index 'idx' is not decremented after splicing.
                // This means the next iteration will check 'idx + 1' (relative to the original position),
                // which might effectively skip an element or re-evaluate a new element at the same 'idx'
                // due to the array shifting. This behavior is preserved from the original code.
                currentSequence.splice(idx, 2);
            }

            // Separately check for the "01" pattern. This 'if' is independent of the previous one,
            // meaning it will execute even if the array was modified by the first 'if' block
            // in the same iteration, potentially acting on newly shifted elements.
            if (currentSequence[idx] === "0" && currentSequence[idx + 1] === "1") {
                matchCount++; // Increment the counter for found pairs.
                noMoreMatches = false; // A match was found, so the outer loop should continue.
                // Remove the two matched characters from the array.
                // Again, 'idx' is not adjusted, preserving the original algorithm's behavior.
                currentSequence.splice(idx, 2);
            }
        }

        // If, after a full pass of the inner loop, no matches were found,
        // then the sequence cannot be reduced further, and the outer loop terminates.
        if (noMoreMatches) {
            break;
        }
    }

    // The final output is twice the total number of pairs found and removed.
    console.log(matchCount * 2);
}

// Read the input from standard input using Node.js file system module
// and pass it to the main processing function.
ProcessSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
