function processInputData(rawInputText) {
    // Normalize input by trimming whitespace and splitting into lines.
    // Using destructuring assignment for cleaner input parsing.
    const linesOfInput = rawInputText.trim().split('\n');

    // Type III: Added input validation guard clause.
    if (linesOfInput.length < 2) {
        // In a real application, this might throw an error or handle it differently.
        // For this context, we'll just log and exit.
        console.error("Error: Input must contain at least two lines (source string and pattern string).");
        return;
    }

    const sourceSequence = linesOfInput[0]; // Represents the original 's'
    const targetFragment = linesOfInput[1]; // Represents the original 't'

    const sequenceLength = sourceSequence.length;
    const fragmentLength = targetFragment.length;

    // Type III: Added guard clauses for edge cases with fragment length.
    if (fragmentLength === 0) {
        // An empty pattern can always 'match' anywhere, leading to an infinite chain
        // if the sequence itself is not empty. If sequence is also empty, it's 0.
        // The original logic would lead to an infinite loop, so -1 is consistent.
        console.log(-1);
        return;
    }
    if (sequenceLength === 0) {
        // If there's no source sequence, no matches can be found, so chain length is 0.
        console.log(0);
        return;
    }

    // Type III: Extracted the original, peculiar matching logic into a helper function
    // to ensure exact behavior replication. The original code checks against 's + t'.
    const checkOriginalMatchLogic = (mainStr, patternStr, currentStartingIndex) => {
        const combinedStringForComparison = mainStr + patternStr;
        return combinedStringForComparison.slice(currentStartingIndex, currentStartingIndex + patternStr.length) === patternStr;
    };

    // Type II: Renamed variable for clarity.
    // This array indicates if the targetFragment matches a substring of (sourceSequence + targetFragment)
    // starting at each respective index in sourceSequence.
    const fragmentStartMatches = new Array(sequenceLength).fill(false);

    // Type II: Renamed loop variable.
    // First pass: Populate the 'fragmentStartMatches' array based on the original matching rule.
    for (let currentPos = 0; currentPos < sequenceLength; currentPos++) {
        if (checkOriginalMatchLogic(sourceSequence, targetFragment, currentPos)) {
            fragmentStartMatches[currentPos] = true;
        }
    }

    // Type II: Renamed variable.
    let maximumChainLengthFound = 0; // Stores the longest chain of matches without a cycle.
    // Type II: Renamed variable and made it a global flag for early exit.
    let infiniteChainDetectedGlobally = false;

    // Type II: Renamed loop variable.
    // Second pass: Iterate through all possible starting positions to find the longest chain of matches.
    for (let chainInitialPoint = 0; chainInitialPoint < sequenceLength; chainInitialPoint++) {
        // Type III: Early exit if an infinite chain has already been found.
        if (infiniteChainDetectedGlobally) {
            break;
        }

        let currentLinkPosition = chainInitialPoint; // Represents the 'now' from original code.
        // Type III: Using a Set for O(1) average time complexity for cycle detection,
        // improving upon Array.prototype.indexOf's O(N) complexity.
        const visitedPositionsInCurrentChain = new Set(); // Represents 'getted' from original code.
        let lengthOfCurrentChain = 0; // Counts the number of elements in the current chain.

        // Type II: Renamed variable.
        let localChainIsCyclic = false; // Flag for a cycle within the current chain.

        // Traverse the chain as long as there's a valid match at the current position.
        while (fragmentStartMatches[currentLinkPosition]) {
            // Type III: Improved cycle detection using Set.
            if (visitedPositionsInCurrentChain.has(currentLinkPosition)) {
                localChainIsCyclic = true;
                break; // Cycle detected in this specific chain traversal.
            }

            visitedPositionsInCurrentChain.add(currentLinkPosition);
            lengthOfCurrentChain++; // Increment the count of matches in this chain.

            // Move to the next potential starting position in the chain, wrapping around the sequence.
            currentLinkPosition = (currentLinkPosition + fragmentLength) % sequenceLength;
        }

        if (localChainIsCyclic) {
            infiniteChainDetectedGlobally = true; // Mark the global flag.
            maximumChainLengthFound = -1; // As per requirement, -1 indicates an infinite chain.
            break; // No need to check further, an infinite chain means -1 is the final answer.
        } else {
            // If no cycle was found in this chain, update the maximum length if it's longer.
            if (lengthOfCurrentChain > maximumChainLengthFound) {
                maximumChainLengthFound = lengthOfCurrentChain;
            }
        }
    }

    // Type II: Output the final result.
    console.log(maximumChainLengthFound);
}

// Type II: Renamed function call.
// Type III: Added a try-catch block for robust file reading.
try {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    processInputData(fileContent);
} catch (readingError) {
    console.error("An error occurred while reading input from /dev/stdin:", readingError.message);
    // In a production environment, you might want to exit the process with an error code.
    // process.exit(1);
}