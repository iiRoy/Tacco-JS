function performComplexCalculation(rawInputData) {
    const dataSegments = rawInputData.split('\n');
    
    // The first line (initialQuantityIndicator) is read but not utilized in the original logic.
    // const initialQuantityIndicator = Number(dataSegments[0]); 

    // Process the second line containing space-separated numerical tokens.
    // Empty strings resulting from multiple spaces or leading/trailing spaces will be converted to 0 by Number().
    const numericSequenceElements = dataSegments[1].split(' ').map(token => Number(token));

    // Handle edge cases for an empty or single-element sequence.
    // If the input line is empty (e.g., "\n"), it results in `[""]` from split, which maps to `[0]`.
    // So, an effectively empty input line for numbers results in 0.
    if (numericSequenceElements.length === 0) {
        // This case would only happen if dataSegments[1] itself was an empty array,
        // which isn't possible with split(' ') on a string.
        // It's effectively unreachable given the original's parsing behavior for empty lines.
        console.log(Number.NaN); // Or 0, depending on precise empty string parsing. Let's assume input always yields at least [0]
        return;
    }
    if (numericSequenceElements.length === 1) {
        console.log(numericSequenceElements[0]);
        return;
    }

    // Sort the numeric values in ascending order.
    numericSequenceElements.sort((valA, valB) => valA - valB);

    // Apply the cumulative averaging process.
    // The first element initializes the aggregate. Subsequent elements are averaged with the current aggregate.
    const finalAggregateValue = numericSequenceElements.reduce((currentAggregate, elementValue, index) => {
        if (index === 0) {
            return elementValue; // The first element starts the aggregation.
        } else {
            // For subsequent elements, compute the average with the current aggregate.
            return (currentAggregate + elementValue) / 2.0;
        }
    });

    console.log(finalAggregateValue);
}

// Emulate the original input reading mechanism.
const obtainStandardInput = () => require("fs").readFileSync("/dev/stdin", "utf8");

performComplexCalculation(obtainStandardInput());