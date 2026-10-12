const fileSystemModule = require("fs");

const processDataEntry = function(inputEntryString) {
    // Split the input string by comma to get individual data elements.
    // The original code implicitly converts these strings to numbers during arithmetic.
    // Explicitly converting them to numbers here adds clarity and robustness,
    // which is a valid Type III modification.
    const rawDataElements = inputEntryString.split(',');
    const numericDataValues = rawDataElements.map(Number);

    let cumulativeCalculationValue = 0;
    const initialLoopBoundary = 10; // Represents the initial value for 'm' and 'n' in the original code

    // First processing loop:
    // Iterates from index 9 down to 0.
    // Each element numericDataValues[mIndex] is replaced by a reverse cumulative sum.
    // The 'cumulativeCalculationValue' variable accumulates the sum of processed elements.
    for (let mIndex = initialLoopBoundary - 1; mIndex >= 0; mIndex--) {
        cumulativeCalculationValue -= numericDataValues[mIndex];
        numericDataValues[mIndex] = cumulativeCalculationValue;
    }

    // Intermediate calculation step:
    // Derives a factor based on numericDataValues[11] and numericDataValues[10].
    // This corresponds to 'a' and the subsequent multiplication in the original.
    const factorNumeratorValue = -numericDataValues[11];
    const factorDenominatorValue = factorNumeratorValue - numericDataValues[initialLoopBoundary]; // numericDataValues[10]
    
    // Avoid division by zero, though the original code doesn't explicitly handle it.
    // Assuming valid input where factorDenominatorValue is not zero.
    const scalingMultiplier = factorNumeratorValue / factorDenominatorValue;
    cumulativeCalculationValue *= scalingMultiplier;

    // Second processing loop:
    // Finds a specific index based on the 'cumulativeCalculationValue'.
    // This loop starts with 'n' (represented by 'searchResultIndex') at 10 and decrements it.
    let searchResultIndex = initialLoopBoundary;
    
    // The original uses a compact for loop without a body.
    // Rewriting it as a while loop with an explicit break condition enhances readability.
    while (true) {
        searchResultIndex--; // Equivalent to '--n'
        if (numericDataValues[searchResultIndex] < cumulativeCalculationValue) {
            break; // Exit when the condition is met
        }
    }

    // Final output: Increment the found index and print it.
    searchResultIndex++; // Equivalent to '++n'
    console.log(searchResultIndex);
};

// Read the entire input from stdin.
const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", 'utf8');

// Trim whitespace from the input and split it by any whitespace character.
const processedInputLines = rawInputContent.trim().split(/\s/);

// Process each resulting input string using the defined function.
processedInputLines.map(processDataEntry);
