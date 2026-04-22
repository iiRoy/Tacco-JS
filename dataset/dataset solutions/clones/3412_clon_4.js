function processData(rawDataInput) {
    // Convert the raw string input into an array of numerical values.
    // The first line is typically a count and is skipped.
    // Empty lines are also filtered out to ensure only valid numbers are processed.
    const numericEntries = rawDataInput
        .split('\n')
        .filter((lineContent, lineIndex) => lineIndex > 0 && lineContent.trim() !== '')
        .map(entry => Number(entry)); // Using Number() for parsing, which is different from parseInt()

    // Employ a single functional reduction to simultaneously determine
    // the aggregate sum of all numbers and the highest value among them.
    // This avoids separate loops or array modifications.
    const statistics = numericEntries.reduce((metrics, currentNumber) => {
        metrics.cumulativeSum += currentNumber;
        if (currentNumber > metrics.extremeValue) {
            metrics.extremeValue = currentNumber;
        }
        return metrics;
    }, { cumulativeSum: 0, extremeValue: -Infinity }); // Initialize extremeValue carefully

    // Compute the final value: the total sum minus half of the extreme value.
    // This is mathematically equivalent to summing all numbers except the max,
    // and then adding half of the max back.
    const derivedValue = statistics.cumulativeSum - (statistics.extremeValue / 2);

    // Display the integer part of the calculated result.
    console.log(Math.floor(derivedValue));
}

// The following line is for executing the function with standard input,
// and is not part of the clonable logic itself.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));