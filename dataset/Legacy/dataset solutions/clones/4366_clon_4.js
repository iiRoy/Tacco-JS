function Main(sourceText) {
    let targetString; 
    
    // Divergent strategy to extract the first line from the input string.
    // Original uses: input.split('\n').shift()
    // This uses a for-of loop with an early break to get the first segment.
    for (const currentLineSegment of sourceText.split('\n')) {
        targetString = currentLineSegment;
        break; 
    }

    // This is the point where the original code attempts to call .map() on a string,
    // which results in a TypeError. This clone must replicate this exact behavior.
    let transformedSegments = targetString.map((element) => { 
        // If this part were reachable, it would parse space-separated numbers.
        return element.split(' ').map(Number); 
    });

    let cumulativeSum = 0;
    // This loop would process the transformed segments, but it will not be reached due to the error.
    transformedSegments.forEach((numericPair) => {
        cumulativeSum += (numericPair[1] - numericPair[0] + 1);
    });

    // This console.log would output the sum, but it will not be reached due to the error.
    console.log('%d', cumulativeSum);
}

// The entry point and external API calls remain identical to preserve the contract.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
