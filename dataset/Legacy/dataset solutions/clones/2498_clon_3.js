function calculateTriplets(inputString) {
    const inputLines = inputString.split('\n');
    const count = parseInt(inputLines[0], 10);
    let numbers = inputLines[1].split(/\s/g);

    // Sort strings lexicographically in descending order
    numbers.sort((valA, valB) => {
        if (valA < valB) {
            return 1;
        }
        if (valA > valB) {
            return -1;
        }
        return 0;
    });

    // Convert string array elements to numbers
    numbers = numbers.map(strVal => parseInt(strVal, 10));

    let total = 0;

    // Pre-calculate loop bounds for clarity and minor optimization
    const midLoopUpperLimit = count - 1;
    const innerLoopStartIdx = count - 1; // Effective starting index for the innermost loop

    for (let outerIdx = 0; outerIdx < count; outerIdx++) {
        for (let midIdx = outerIdx + 1; midIdx < midLoopUpperLimit; midIdx++) {
            // The original 'k' loop started at 'honsuu' (count),
            // which would access ngs[count] (undefined).
            // ngs[j] + undefined results in NaN, making the 'if' condition false.
            // Thus, the k=count iteration is a no-op and can be safely omitted
            // by starting the loop from 'count - 1'.
            for (let innerIdx = innerLoopStartIdx; innerIdx > midIdx; innerIdx--) {
                const currentSumOfTwo = numbers[midIdx] + numbers[innerIdx];
                if (numbers[outerIdx] < currentSumOfTwo) {
                    total += innerIdx - midIdx;
                    break; // Exit the innermost loop
                }
            }
        }
    }
    console.log(total);
}

calculateTriplets(require('fs').readFileSync('/dev/stdin', 'utf8'));
