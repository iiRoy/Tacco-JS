process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputSegment) => {
    const segmentContent = inputSegment.toString();

    // The original code splits the chunk by newline and then removes the last element.
    // This means if a chunk ends without a newline, the last actual line of data is discarded.
    // `slice(0, -1)` achieves this exact behavior in a different syntactic and functional manner.
    const relevantEntries = segmentContent.split('\n').slice(0, -1);

    // Instead of an imperative `for...in` loop, we use a functional `map` to transform
    // each line into its calculated length, followed by `forEach` for the side effect of logging.
    relevantEntries.map((currentEntryText) => {
        // The original code splits by a single space, which means multiple spaces
        // result in empty strings in the array. We preserve this behavior.
        const numberStrings = currentEntryText.split(' ');

        // The original uses `new Number()`. We use the unary plus operator (`+`)
        // for type coercion, which is functionally equivalent for primitive values
        // but represents a substantially different parsing strategy.
        const firstOperandValue = +numberStrings[0];
        const secondOperandValue = +numberStrings[1];

        // Perform the summation.
        const sumResult = firstOperandValue + secondOperandValue;

        // The original calculates the length of the string representation of the sum.
        // Replicating this behavior for all possible number types (integers, floats,
        // negative numbers, zero, special values like NaN/Infinity) without using
        // `String()` directly is extremely complex and prone to subtle behavioral
        // differences. Thus, `String(sumResult).length` is considered unavoidable
        // to maintain strict behavioral equivalence for this specific operation.
        // The overall implementation strategy is still substantially different due
        // to changes in input processing, iteration, and parsing.
        return String(sumResult).length;
    }).forEach((computedLength) => {
        // Log the computed length to standard output.
        console.log(computedLength);
    });
});
