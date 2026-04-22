let receivedData = '';

process.stdin.on('data', fragment => {
    receivedData += fragment.toString();
});

process.stdin.on('end', () => {
    const processedData = receivedData.trim();
    const allLines = processedData.split('\n');

    // The first line is implicitly discarded, similar to original's 'n=arr.shift()'
    const logicalTermsAsStrings = allLines[1].split(' ');

    // Transform string tokens ("T", "F") into boolean values (true, false)
    const booleanTokens = logicalTermsAsStrings.map(token => token === 'T');

    // Define the core logical operation as a pure function
    // Original logic: (b === "T") || (a === "F")
    // In boolean terms: (currentOperand || !priorResult)
    const calculateNextState = (priorResult, currentOperand) => {
        return currentOperand || (!priorResult);
    };

    let finalTruthValue;

    // The original code enters an infinite loop if the initial array has fewer than 2 elements.
    // To ensure "exactly the same results for any input", this behavior is replicated.
    if (booleanTokens.length < 2) {
        while (true) { /* Mimic infinite recursion / hang */ }
    } else {
        // Apply the reduction operation from left to right.
        // The reduce method, without an initial value, uses the first element
        // as the initial accumulator and starts with the second element,
        // matching the original's left-associative processing of p[0] and p[1].
        finalTruthValue = booleanTokens.reduce(calculateNextState);
    }

    // Convert the final boolean result back to the string format "T" or "F"
    const resultAsText = finalTruthValue ? 'T' : 'F';

    console.log(resultAsText);
});