function Main(input) {
    const initialSequence = input.trim();

    // Recursive function to find and transform patterns, accumulating a count.
    // This approach implicitly restarts the search from the beginning of the
    // modified string in each recursive call, which effectively handles
    // overlapping matches similar to the original's index adjustment.
    function processSequence(currentSequence, currentTally) {
        const targetPattern = "ABC";
        const substitutePattern = "BCA";

        // Attempt to locate the target pattern within the current sequence.
        const occurrenceIndex = currentSequence.indexOf(targetPattern);

        // Base case: If the target pattern is no longer found,
        // return the accumulated tally of transformations.
        if (occurrenceIndex === -1) {
            return currentTally;
        }

        // Recursive step:
        // 1. Increment the transformation tally.
        const nextTally = currentTally + 1;

        // 2. Construct the new sequence by replacing the found pattern.
        //    The string is split into three parts:
        //    - The segment before the found pattern.
        //    - The substitute pattern.
        //    - The segment after the found pattern.
        const nextSequence = currentSequence.substring(0, occurrenceIndex) +
                             substitutePattern +
                             currentSequence.substring(occurrenceIndex + targetPattern.length);

        // 3. Recursively call the function with the new sequence and updated tally.
        //    The `indexOf` method in the next call will search from the start
        //    of `nextSequence`, which is crucial for replicating the original's
        //    behavior of re-evaluating potentially new matches formed by the replacement.
        return processSequence(nextSequence, nextTally);
    }

    // Initiate the transformation process with the initial sequence and a starting tally of zero.
    const finalTally = processSequence(initialSequence, 0);

    // Output the total number of transformations performed.
    console.log(finalTally);
}

// Standard input handling for the execution environment.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
