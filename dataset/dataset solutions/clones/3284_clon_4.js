const ProcessInputData = (rawInputContent) => {
    // Phase 1: Normalize and parse all numeric values from the input string into a single flat array.
    // This handles various whitespace patterns (spaces, newlines) as delimiters.
    const numericalPayload = rawInputContent
        .split(/\s+/) // Split by one or more whitespace characters
        .filter(Boolean) // Remove any empty strings that might result from splitting
        .map(Number); // Convert each string part to a number

    // Phase 2: Extract the problem parameters and the array of values.
    // The first element in the payload is the count of values (N),
    // the next two are the thresholds (A and B),
    // and the remaining elements constitute the list of values (P).
    const totalElementCount = numericalPayload[0]; // Corresponds to N in original, though not strictly used in classification logic.
    const primaryThreshold = numericalPayload[1]; // Corresponds to A
    const secondaryThreshold = numericalPayload[2]; // Corresponds to B
    const valueCollection = numericalPayload.slice(3); // Corresponds to P array

    // Phase 3: Categorize and count the elements using a functional approach with multiple filters.
    // This avoids an imperative loop with conditional branching (if/else if/else) and direct array pushes.
    const firstCategoryTally = valueCollection.filter(elementValue => elementValue <= primaryThreshold).length;
    const secondCategoryTally = valueCollection.filter(elementValue => elementValue > primaryThreshold && elementValue <= secondaryThreshold).length;
    const thirdCategoryTally = valueCollection.filter(elementValue => elementValue > secondaryThreshold).length;

    // Phase 4: Determine the smallest count among the three categories.
    // This is achieved by placing the tallies into an array and then sorting it
    // to easily retrieve the minimum value as the first element.
    const categoryTallies = [firstCategoryTally, secondCategoryTally, thirdCategoryTally];
    const finalOutcome = categoryTallies.sort((valA, valB) => valA - valB)[0];

    // Phase 5: Output the calculated result to the console.
    console.log(finalOutcome);
};

// Invoke the data processing function with input read from standard input.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));