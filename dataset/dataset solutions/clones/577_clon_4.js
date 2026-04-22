(function (incomingData) {

    // Helper to recursively generate all possible substrings from a given string.
    // This replaces nested loops for substring generation with a functional, recursive pattern.
    const gatherSubstrings = (sourceText) => {
        const acquireFromIndex = (currentIndex) => {
            // Base case: if the current index is beyond the string length, no more substrings can be formed.
            if (currentIndex >= sourceText.length) {
                return [];
            }

            // Generate substrings starting from currentIndex.
            // Array.from creates an array of lengths (1 to remaining length)
            // and maps them to actual substring values.
            const currentPositionSubstrings = Array.from({ length: sourceText.length - currentIndex }, (_, extentDelta) =>
                sourceText.substring(currentIndex, currentIndex + extentDelta + 1)
            );

            // Recursively get substrings from the next starting position and combine them.
            return currentPositionSubstrings.concat(acquireFromIndex(currentIndex + 1));
        };
        // Start the recursive process from the beginning of the string.
        return acquireFromIndex(0);
    };

    // Core logic to determine the length of the longest common substring between two strings
    // that does NOT start at the beginning of the longer string.
    // This replaces the original's iterative substring extension with a generate-and-filter approach.
    const computePairResult = (firstString, secondString) => {
        let shorterInput, longerInput;

        // Identify the shorter and longer string to optimize substring generation.
        if (firstString.length < secondString.length) {
            shorterInput = firstString;
            longerInput = secondString;
        } else {
            shorterInput = secondString;
            longerInput = firstString;
        }

        // Generate all substrings from the shorter string.
        const potentialSubstrings = gatherSubstrings(shorterInput);

        // Filter these substrings:
        // 1. They must exist in the longer string.
        // 2. Their first occurrence in the longer string must NOT be at index 0 (the specific original requirement).
        // Then, map the filtered substrings to their lengths.
        const qualifyingLengths = potentialSubstrings
            .filter(segment => longerInput.indexOf(segment) > 0)
            .map(segment => segment.length);

        // If there are any qualifying substrings, return the maximum of their lengths; otherwise, return 0.
        return qualifyingLengths.length > 0 ? Math.max(...qualifyingLengths) : 0;
    };

    // Function to process the entire raw input data, line by line.
    // This replaces the imperative `while(true)` loop with a recursive function.
    const processAllData = (rawTextContent) => {
        // Normalize line endings and split into individual lines.
        const textLines = rawTextContent.replace(/\r/g, '').split("\n");
        let collectedOutcomes = [];
        let readingPointer = 0; // Tracks the current line being processed.

        // Recursive handler to sequentially process pairs of lines.
        const handleNextSegment = () => {
            // Base case 1: If the reading pointer exceeds the number of lines, stop.
            if (readingPointer >= textLines.length) {
                return;
            }

            const primaryLine = textLines[readingPointer];
            // Base case 2: An empty primary line signals the termination of input processing.
            if (primaryLine === '') {
                return;
            }

            const secondaryLine = textLines[readingPointer + 1];
            // Safeguard: If there's a primary line but no corresponding secondary line, stop.
            if (secondaryLine === undefined) {
                 return;
            }

            // Compute the result for the current pair and store it.
            collectedOutcomes.push(computePairResult(primaryLine, secondaryLine));

            // Advance the pointer to the next pair of lines.
            readingPointer += 2;
            // Recursively call to process the next segment.
            handleNextSegment();
        };

        // Initiate the recursive processing.
        handleNextSegment();
        return collectedOutcomes;
    };

    // Execute the full processing pipeline:
    // 1. Read input from stdin.
    // 2. Process all data to get an array of results.
    // 3. Print each result to the console, one per line.
    const finalCalculations = processAllData(incomingData);
    finalCalculations.forEach(singleResult => console.log(singleResult));

})(require("fs").readFileSync("/dev/stdin", "utf8"));