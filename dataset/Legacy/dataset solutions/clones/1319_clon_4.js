function processInputData(rawData) {
    const contentRows = rawData.split("\n");
    const primarySequence = contentRows[0];
    const searchPattern = contentRows[1];

    const extendedSource = primarySequence + primarySequence;

    let isPatternFound = false;

    if (searchPattern.length === 0) {
        // An empty string is always considered a substring at the beginning of any string.
        isPatternFound = true;
    } else if (searchPattern.length > extendedSource.length) {
        // If the pattern is longer than the text to search within, it cannot be found.
        isPatternFound = false;
    } else {
        // Implement a manual, naive substring search algorithm.
        // Iterate through all possible starting positions in the extended source.
        for (let sourceIndex = 0; sourceIndex <= extendedSource.length - searchPattern.length; sourceIndex++) {
            let currentSegmentMatches = true;
            // Compare characters from the current starting position with the pattern.
            for (let patternIndex = 0; patternIndex < searchPattern.length; patternIndex++) {
                if (extendedSource[sourceIndex + patternIndex] !== searchPattern[patternIndex]) {
                    currentSegmentMatches = false;
                    break; // Mismatch found, move to the next starting position in the source.
                }
            }
            if (currentSegmentMatches) {
                isPatternFound = true;
                break; // Full pattern matched, no need to check further.
            }
        }
    }

    console.log(isPatternFound ? "Yes" : "No");
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf-8"));
