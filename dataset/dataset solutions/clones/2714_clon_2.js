// This function orchestrates the processing of textual data.
function ProcessInput(rawData) {
    // The incoming data is first split into individual lines,
    // preparing it for further analysis.
    rawData = rawData.split("\n");

    // The first line from the input array is designated as the primary sequence.
    const mainSequence = rawData[0];
    // The second line is designated as the sub-pattern to be searched for.
    const subPattern = rawData[1];

    // An array to store boolean flags, indicating whether the sub-pattern
    // is found starting at each respective index of the main sequence.
    const occurrenceFlags = [];

    // Begin an iteration through the primary sequence to identify all positions
    // where the sub-pattern might start.
    for ( let idx = 0; idx < mainSequence.length; idx++ ) {
        // To handle potential pattern matches that wrap around the end of the
        // main sequence, the main sequence is concatenated with the sub-pattern.
        // This allows `slice` to correctly extract the potential match.
        if ( (mainSequence + subPattern).slice(idx, idx + subPattern.length) === subPattern ) {
            occurrenceFlags.push(true);  // If a match is found, mark it as true.
        }
        else {
            occurrenceFlags.push(false); // Otherwise, mark it as false.
        }
    }

    // Initialize a variable to keep track of the longest valid chain of matches found.
    let longestChain = 0;

    // Start a second phase of iteration, analyzing the sequences of consecutive matches
    // based on the flags determined in the previous step.
    for ( let idx = 0; idx < mainSequence.length; idx++ ) {
        let isCyclic = false;       // A flag to detect if an infinite loop (cycle) is encountered.
        let currentPos = idx;       // Represents the current starting position in the sequence of matches.
        const visitedIndices = [];  // Stores the indices already visited in the current chain traversal.

        // Continue traversing the chain as long as the current position is a valid match.
        while ( occurrenceFlags[currentPos] ) {
            visitedIndices.push(currentPos); // Add the current index to the list of visited positions.
            // Calculate the next potential starting position for the pattern,
            // ensuring it wraps around using the modulo operator.
            currentPos = (currentPos + subPattern.length) % mainSequence.length;

            // Check if the newly calculated 'next position' has already been visited
            // within this specific chain. If so, a cycle is detected.
            if ( visitedIndices.includes(currentPos) ) {
                isCyclic = true; // Set the cycle flag.
                break;           // Exit the inner while loop as an infinite chain is found.
            }
        }

        // After completing a chain traversal, check if a cycle was detected.
        if ( isCyclic ) {
            longestChain = -1; // If a cycle exists, the problem defines the result as -1.
            break;             // No need to check further chains, as -1 is the definitive result.
        }
        else {
            // If no cycle was found, compare the length of the current chain
            // with the longest chain found so far and update if necessary.
            if ( longestChain < visitedIndices.length ) {
                longestChain = visitedIndices.length;
            }
        }
    }

    // Finally, print the determined longest chain length to the console.
    console.log(longestChain);
}

// The ProcessInput function is invoked, reading its input from standard input
// via Node.js's file system module, ensuring UTF-8 encoding.
ProcessInput(require("node:fs").readFileSync("/dev/stdin", "utf-8"));