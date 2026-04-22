// This function processes numerical data to calculate specific pair combinations.
function analyzeNumberFrequencies(rawDataPayload) {
    // Ensure raw data is provided and not empty.
    if (!rawDataPayload || typeof rawDataPayload !== 'string' || rawDataPayload.trim().length === 0) {
        console.error("Error: Input data payload is empty or invalid.");
        return; // Exit if no valid input
    }

    // Split the input string into individual lines.
    const dataLines = rawDataPayload.trim().split('\n');

    // We expect at least two lines: one for metadata (optional) and one for numbers.
    if (dataLines.length < 2) {
        console.error("Error: Insufficient data lines provided.");
        return;
    }

    // The second line contains the space-separated numbers.
    // Convert these string representations into an array of integers.
    const numericSequence = dataLines[1].split(' ').map(numStr => {
        const parsedNum = Number(numStr);
        // Basic validation: ensure it's a valid number.
        if (isNaN(parsedNum)) {
            console.warn(`Warning: Non-numeric value '${numStr}' encountered and skipped.`);
            return null; // Skip invalid numbers
        }
        return parsedNum;
    }).filter(val => val !== null); // Remove any skipped invalid entries

    // Early exit if no valid numbers are found.
    if (numericSequence.length === 0) {
        console.log(""); // Or some other appropriate output for empty sequence
        return;
    }

    // A map to store the occurrence count of each unique number.
    // Using a Map provides flexibility over a fixed-size array for potentially sparse or large-range integers.
    const occurrenceCounts = new Map();

    // Populate the frequency map by iterating through the numeric sequence.
    for (const currentNumber of numericSequence) {
        // Increment the count for the current number. Initialize to 0 if not present.
        occurrenceCounts.set(currentNumber, (occurrenceCounts.get(currentNumber) || 0) + 1);
    }

    // Helper function to calculate combinations of 2 (n C 2).
    // This represents the number of unique pairs that can be formed from 'count' identical items.
    const calculateCombinationsOfTwo = (count) => {
        // If there are fewer than 2 items, no pairs can be formed.
        if (count < 2) {
            return 0;
        }
        // Formula for combinations: n * (n - 1) / 2
        return (count * (count - 1)) / 2;
    };

    // Calculate the initial total sum of all possible pairs across all distinct numbers.
    let aggregatePairCount = 0;
    // Iterate through the values (counts) in the frequency map.
    for (const count of occurrenceCounts.values()) {
        aggregatePairCount += calculateCombinationsOfTwo(count);
    }

    // Prepare an array to store the computed results for each element in the original sequence.
    const computedResults = [];

    // For each number in the original input sequence,
    // calculate the total pairs if that specific instance of the number were removed.
    for (const originalValue of numericSequence) {
        // Retrieve the total occurrences of the current number.
        const currentNumberTotalOccurrences = occurrenceCounts.get(originalValue);

        // If for some reason the number is not in the map (e.g., due to filtering invalid numbers),
        // we might handle this as an edge case, though it shouldn't happen with current logic.
        if (currentNumberTotalOccurrences === undefined) {
             computedResults.push(aggregatePairCount); // Or 0, depending on desired behavior for missing values
             continue;
        }

        // The number of pairs that would be lost if this instance of 'originalValue' was removed
        // is equivalent to (currentNumberTotalOccurrences - 1).
        // This is because each of the other (currentNumberTotalOccurrences - 1) instances
        // would no longer form a pair with the removed instance.
        const reductionInPairsForCurrentValue = currentNumberTotalOccurrences - 1;

        // The new total pair count is the original total minus the reduction.
        const resultantPairCount = aggregatePairCount - reductionInPairsForCurrentValue;

        // Store the result.
        computedResults.push(resultantPairCount);
    }

    // Output all results, each on a new line.
    console.log(computedResults.join('\n'));
}

// Entry point: Read input from standard input and pass it to our analysis function.
// This assumes an environment where `require("fs")` is available (e.g., Node.js).
analyzeNumberFrequencies(require("fs").readFileSync("/dev/stdin", "utf8").trim());