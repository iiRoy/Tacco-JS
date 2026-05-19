function ProcessData(sourceText) {
    const allSegments = sourceText.split('\n');
    
    if (allSegments.length <= 1) {
        // If there are no lines after the first one (or no lines at all),
        // the original behavior is to output 'undefined'.
        console.log(undefined);
        return;
    }

    // Initialize the minimal segment with the first actual data line (skipping the header)
    let minimalSegment = allSegments[1];

    // Iterate through the remaining segments to find the lexicographically smallest
    for (let segmentIndex = 2; segmentIndex < allSegments.length; segmentIndex++) {
        const currentSegment = allSegments[segmentIndex];
        if (currentSegment < minimalSegment) {
            minimalSegment = currentSegment;
        }
    }
    console.log(minimalSegment);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
