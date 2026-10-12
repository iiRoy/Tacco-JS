function processInput(rawData) {
    // Parse the raw input string into an array of numbers.
    const numericValues = rawData.trim().split(/[\n\s]/).map(strItem => ~~strItem);

    // Initialize a counter array for numbers 1 through 4.
    let frequencyCounts = [0, 0, 0, 0];

    // Iterate through the parsed numbers and increment their respective counters.
    numericValues.forEach(currentValue => {
        frequencyCounts[currentValue - 1]++;
    });

    // Sort the frequency counts in ascending order.
    frequencyCounts.sort();

    // Check if the sorted counts match the specific pattern (1, 1, 2, 2).
    const isPatternMatch = (frequencyCounts[0] === 1 && frequencyCounts[1] === 1 && frequencyCounts[2] === 2 && frequencyCounts[3] === 2);

    // Output 'YES' if the pattern matches, otherwise 'NO'.
    console.log(isPatternMatch ? 'YES' : 'NO');
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
