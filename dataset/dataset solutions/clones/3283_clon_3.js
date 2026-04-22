// Function to process a stream of numerical data and categorize it based on thresholds
function AnalyzeNumericSegments(inputPayload) {
    // Parse the raw input string into an array of individual lines.
    // Using a regular expression to handle both Windows (\r\n) and Unix (\n) line endings gracefully.
    const segmentedInputLines = inputPayload.split(/\r?\n/);

    // Type III addition: Implement a guard clause for inadequate input data.
    // This ensures the program doesn't attempt to access non-existent array elements.
    if (segmentedInputLines.length < 3) {
        // In a real application, more robust error handling or a default output might be needed.
        // For this context, we'll simply output 0 as a safe default for insufficient data.
        console.log(0);
        return;
    }

    // Extract the total count of elements from the first line.
    // Using parseInt with an explicit radix (10) for robust number conversion.
    const declaredElementCount = parseInt(segmentedInputLines[0], 10);

    // Parse the two threshold values (originally A and B) from the second line.
    const boundaryValuesAsString = segmentedInputLines[1].split(' ');
    let primaryThreshold = parseInt(boundaryValuesAsString[0], 10);
    let secondaryThreshold = parseInt(boundaryValuesAsString[1], 10);

    // Type III addition: Ensure the thresholds are in ascending order.
    // The categorization logic implicitly assumes `primaryThreshold <= secondaryThreshold`.
    // If they are provided out of order, swap them to maintain consistent logic.
    if (primaryThreshold > secondaryThreshold) {
        // Utilize ES6 array destructuring for a concise swap operation.
        [primaryThreshold, secondaryThreshold] = [secondaryThreshold, primaryThreshold];
    }

    // Extract the raw string representations of the data elements from the third line.
    const rawDataElementStrings = segmentedInputLines[2].split(' ');

    // Convert the array of string elements to an array of numerical values.
    // Using `parseFloat` to allow for potential decimal numbers, though the problem typically implies integers.
    // This replaces the original explicit `for` loop for string-to-number conversion.
    const processedNumericalDataPoints = rawDataElementStrings.map(str => parseFloat(str));

    // Type III addition: Early exit condition for scenarios where there are no data points to categorize.
    // This enhances efficiency by avoiding unnecessary processing.
    if (processedNumericalDataPoints.length === 0 || declaredElementCount === 0) {
        console.log(0);
        return;
    }

    // Sort the numerical data points in ascending order.
    // Employing a concise arrow function for the comparison logic, which is a common modern JavaScript pattern.
    processedNumericalDataPoints.sort((valueA, valueB) => valueA - valueB);

    // Initialize three distinct collections (arrays) to store categorized data points.
    // Renamed variables for better descriptive clarity, distinct from the original.
    const elementsBelowPrimary = [];
    const elementsBetweenBoundaries = [];
    const elementsAboveSecondary = [];

    // Iterate through each sorted data point and assign it to the appropriate category.
    // Using a `for...of` loop for cleaner and more readable iteration over array elements,
    // which is a modern alternative to the traditional C-style `for` loop.
    for (const currentDataPoint of processedNumericalDataPoints) {
        // Apply the categorization rules based on the established thresholds.
        if (currentDataPoint <= primaryThreshold) {
            // If the data point is less than or equal to the first threshold.
            elementsBelowPrimary.push(currentDataPoint);
        } else if (currentDataPoint <= secondaryThreshold) {
            // If the data point is greater than the first threshold but less than or equal to the second.
            elementsBetweenBoundaries.push(currentDataPoint);
        } else {
            // If the data point is greater than the second threshold.
            elementsAboveSecondary.push(currentDataPoint);
        }
    }

    // Type III addition: Create an intermediate array to hold the lengths of each category.
    // This improves readability by separating the length extraction from the final `Math.min` call.
    const calculatedGroupSizes = [
        elementsBelowPrimary.length,
        elementsBetweenBoundaries.length,
        elementsAboveSecondary.length
    ];

    // Determine and output the minimum count among the three categorized groups.
    // The spread operator (`...`) is used to pass the array elements as individual arguments to `Math.min`.
    console.log(Math.min(...calculatedGroupSizes));
}

// This section handles the program's entry point, reading input from standard input.
// It remains largely unchanged as it's an environment-specific I/O operation.
AnalyzeNumericSegments(require("fs").readFileSync("/dev/stdin", "utf8"));