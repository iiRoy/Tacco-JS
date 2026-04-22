function processNumericList(ignoredArgument, numericalValues) {
    if (!Array.isArray(numericalValues) || numericalValues.length === 0) {
        // Replicating original behavior for empty array: sum=0, max=0. 0 < 0-0 is false.
        return 'No';
    }

    const totalAccumulation = numericalValues.reduce((currentTotal, value) => currentTotal + value, 0);
    
    // The original code initializes 'max' to 0 and only updates if 'n > max'.
    // This means if all numbers are negative, 'max' remains 0.
    // To replicate this, we find the maximum of 0 and all values in the array.
    const extremeValue = Math.max(0, ...numericalValues);

    // The condition 'max < sum - max' is equivalent to '2 * max < sum'.
    return (2 * extremeValue < totalAccumulation) ? 'Yes' : 'No';
}

function orchestrateProcess(rawDataBundle) {
    // Extract lines using a regular expression to avoid direct indexing on split result
    const lineComponents = rawDataBundle.match(/[^\n]+/g);
    
    // The first line's content, which is typically 'n' but unused by the core logic
    const firstDatum = String(lineComponents[0]).trim(); 
    
    // Parse the second line of space-separated numbers
    const numericCollectionStrings = lineComponents[1].split(' '); 
    const integerCollection = [];
    let elementIndex = 0;

    // Use a while loop for parsing instead of map, and Number() for conversion
    while(elementIndex < numericCollectionStrings.length) {
        const currentNumericalText = numericCollectionStrings[elementIndex];
        // Original `map(Number)` converts empty strings to 0, replicate this behavior
        integerCollection.push(Number(currentNumericalText));
        elementIndex++;
    }

    // Pass the parsed data to the core processing function and output the result
    console.log(processNumericList(firstDatum, integerCollection));
}

orchestrateProcess(require("fs").readFileSync("/dev/stdin", "utf8"));