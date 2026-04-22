function processNumericalData(sourceContent) {
    let outcomeDesignation = 'No';

    // Parse the input string to extract numerical components from the initial line.
    // This deviates from the original's direct string splitting and uses regex
    // after isolating the first line of content.
    const numericCollection = sourceContent.split('\n')[0].match(/-?\d+/g).map(Number);

    // Extract the individual numbers.
    const firstValue = numericCollection[0];
    const secondValue = numericCollection[1];
    const thirdValue = numericCollection[2];

    // Determine if exactly two of the three numbers are identical.
    // This approach uses a Set to count distinct values, differing from the
    // original's sorting and sequential conditional checks.
    const uniqueElements = new Set([firstValue, secondValue, thirdValue]);

    // If the set contains exactly two unique elements, it means two numbers were
    // identical and one was different, fulfilling the condition for 'Yes'.
    if (uniqueElements.size === 2) {
        outcomeDesignation = 'Yes';
    }

    console.log(outcomeDesignation);
}

// The following lines are standard boilerplate for handling input/output in competitive
// programming environments using Node.js and should remain unchanged.
processNumericalData(require("fs").readFileSync("/dev/stdin", "utf8"));