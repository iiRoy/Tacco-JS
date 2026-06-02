function processInputData(rawInputContent) {
    const inputLines = rawInputContent.trim().split("\n");

    // The first line, typically representing 'N' (number of characters in S),
    // is discarded as it's not used in the original logic.
    inputLines.shift(); 

    // The second line contains the sequence string (original 's').
    const sequenceString = inputLines.shift(); 
    
    // Introduce a constant for the target pattern 'AC' for clarity and potential reusability.
    const TARGET_AC_PAIR = 'AC';

    // Parse the remaining lines as query ranges. Each line is split, converted to numbers,
    // and then 1 is subtracted from each number to make them 0-indexed.
    const queryRanges = inputLines.map(line => 
        line.split(" ").map(Number).map(val => val - 1)
    );

    // Initialize an array to store cumulative counts of 'AC' pairs.
    // CRITICAL: The length of this array is determined by the number of queries (queryRanges.length),
    // mirroring the original code's `new Array(arg.length)`. This design choice is preserved,
    // even if it implies potential out-of-bounds access if `sequenceString.length` exceeds `queryRanges.length`.
    const acPrefixCounts = new Array(queryRanges.length).fill(0); 
    
    // Initialize a counter for 'AC' pairs.
    let currentAcPairCount = 0; 

    // The original code included an 'indexs' array that was declared and initialized
    // but never subsequently used. This dead code has been removed.

    // Iterate through the sequence string to calculate prefix sums of 'AC' pairs.
    // The loop runs up to `sequenceString.length - 1` (exclusive), meaning `loopIdx` goes from `0` to `sequenceString.length - 2`.
    // This ensures `sequenceString[loopIdx + 1]` is always a valid index for the pair check.
    for (let loopIdx = 0; loopIdx < sequenceString.length - 1; ++loopIdx) {
        // Check if the substring starting at `loopIdx` forms the target 'AC' pair.
        if (sequenceString.substring(loopIdx, loopIdx + 2) === TARGET_AC_PAIR) {
            currentAcPairCount++;
        }
        // Store the cumulative count. `acPrefixCounts[k]` will represent the count of 'AC' pairs
        // in the substring `sequenceString[0...k-1]`.
        // The index `loopIdx + 1` will range from `1` to `sequenceString.length - 1`.
        acPrefixCounts[loopIdx + 1] = currentAcPairCount;
    }

    // Process each query range.
    // Using a `for...of` loop with destructuring assignment for cleaner iteration.
    for (const queryPair of queryRanges) {
        // Extract the 0-indexed left and right bounds for the current query.
        const [queryLeft, queryRight] = queryPair; 
        
        // Retrieve the cumulative counts at the right and left boundaries.
        // These are intermediate computation steps for clarity.
        const countUpToRight = acPrefixCounts[queryRight];
        const countUpToLeft = acPrefixCounts[queryLeft];
        
        // The difference gives the count of 'AC' pairs within the specified range [queryLeft, queryRight).
        console.log(countUpToRight - countUpToLeft);
    }
}

// The entry point for the program, reading input from stdin.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
