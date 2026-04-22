const processInputData = (rawDataString) => {
    // --- Input Validation and Initial Parsing ---
    // Ensure the raw input is a valid string.
    if (typeof rawDataString !== 'string' || rawDataString === null) {
        console.error("Error: Input data must be a non-null string.");
        return; // Terminate if input is invalid
    }

    // Trim whitespace from the input and split it into individual lines.
    const sanitizedInput = rawDataString.trim();
    const inputLines = sanitizedInput.split('\n');

    // Verify that the input contains at least two lines (for N and the array of numbers).
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input. Expected at least two lines (count N, then values).");
        return;
    }

    // --- Parse Element Count (N) ---
    // Extract the first part of the first line, which should be the count N.
    // Using Number() for parsing, which handles various number formats.
    const declaredCountString = inputLines[0].split(' ')[0];
    const elementCount = Number(declaredCountString);

    // Validate the parsed count N.
    if (isNaN(elementCount) || !Number.isInteger(elementCount) || elementCount <= 0) {
        console.error(`Error: Invalid or non-positive integer for element count (N): '${declaredCountString}'.`);
        return;
    }

    // --- Parse Array of Values (X) ---
    // Split the second line by spaces and convert each string segment to a number.
    const initialValues = inputLines[1].split(' ').map(valueStr => {
        const numericValue = Number(valueStr);
        // Additional validation for individual numbers in the array.
        if (isNaN(numericValue)) {
            console.error(`Warning: Non-numeric value found in input array: '${valueStr}'. It will be treated as NaN.`);
        }
        return numericValue;
    });

    // --- Consistency Check and Median Pre-conditions ---
    // Ensure the actual number of values matches the declared count N.
    if (initialValues.length !== elementCount) {
        console.error(`Error: Declared element count N (${elementCount}) does not match the actual number of values (${initialValues.length}).`);
        return;
    }

    // For this specific median calculation logic, N must be an even number.
    if (elementCount % 2 !== 0) {
        console.error(`Error: Element count N (${elementCount}) must be an even number for this median calculation method.`);
        return;
    }

    // --- Median Calculation ---
    // Create a sorted, independent copy of the input values to find medians.
    const orderedValues = [...initialValues].sort((valA, valB) => valA - valB);

    // Determine the indices for the two middle elements (medians) for an even-sized array.
    const midPoint = elementCount / 2; // This is safe because elementCount is guaranteed to be even.
    const lowerMedianIndex = midPoint - 1;
    const upperMedianIndex = midPoint;

    // Retrieve the actual median values from the sorted array.
    const lowerMedianValue = orderedValues[lowerMedianIndex];
    const upperMedianValue = orderedValues[upperMedianIndex];

    // --- Result Generation ---
    // Initialize an array to store the computed results for each original value.
    const resultCollection = [];

    // Iterate through each value in the original, unsorted array.
    for (let k = 0; k < initialValues.length; ++k) {
        const currentOriginalValue = initialValues[k];

        // Apply the conditional logic:
        // If the current value is strictly less than the upper median, use the upper median.
        // Otherwise (current value is greater than or equal to the upper median), use the lower median.
        if (currentOriginalValue < upperMedianValue) {
            resultCollection.push(upperMedianValue);
        } else {
            resultCollection.push(lowerMedianValue);
        }
    }

    // --- Output Results ---
    // Join all collected results with newline characters and print them to the console.
    console.log(resultCollection.join('\n'));
};

// The entry point for execution: reads input from standard input and passes it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));