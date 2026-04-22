function processInputData(rawDataString) {
    // This function orchestrates the parsing, processing, and calculation logic
    // based on the provided raw input string.

    // --- Input Parsing and Initial Validation ---

    // Normalize line endings and filter out any completely empty lines.
    const cleanLineSegments = rawDataString.trim().split(/\r?\n/).filter(line => line.length > 0);

    // A basic check to ensure we have at least three lines:
    // 1. The count limit
    // 2. At least one geometric pair definition
    // 3. The list of metric values
    if (cleanLineSegments.length < 3) {
        console.error("Error: Insufficient input data provided. Expected at least three lines.");
        // In a real application, you might throw an error or return a specific error state.
        return;
    }

    // Parse the first line to determine the maximum number of metric values to consider.
    // We use `Number()` for type coercion and `Math.max(1, ...)` to ensure a positive integer.
    const maximumMetricCount = Math.max(1, Math.floor(Number(cleanLineSegments[0]) || 0));
    if (isNaN(maximumMetricCount) || maximumMetricCount <= 0) {
        console.warn(`Warning: Invalid or non-positive metric count '${cleanLineSegments[0]}'. Defaulting to 1.`);
    }

    // Helper function to parse a single line containing space-separated numbers.
    // It filters out non-numeric entries and sorts the resulting numbers in ascending order.
    const parseLineToSortedNumbers = (lineContent) => {
        const numericElements = lineContent.split(" ")
                                           .map(str => Number(str.trim()))
                                           .filter(val => !isNaN(val)); // Ensure only valid numbers are kept.

        if (numericElements.length === 0) {
            // Handle cases where a line might be empty or contains only non-numeric data.
            return [];
        }
        return numericElements.sort((a, b) => a - b);
    };

    // Extract and process the lines defining geometric edge pairs.
    // These are all lines between the first (count) and the last (metric values).
    const rawGeometricPairs = cleanLineSegments.slice(1, -1).map(parseLineToSortedNumbers);

    // Filter out any parsed "pairs" that don't actually contain two numbers.
    const validatedGeometricPairs = rawGeometricPairs.filter(pair => pair.length === 2);
    if (validatedGeometricPairs.length !== rawGeometricPairs.length) {
        console.warn("Warning: Some geometric edge definitions were malformed (not exactly two numbers) and have been excluded.");
    }

    // Parse the last line to get the initial pool of metric values.
    let initialMetricPool = cleanLineSegments[cleanLineSegments.length - 1]
                                .split(" ")
                                .map(str => Number(str.trim()))
                                .filter(val => !isNaN(val));

    // Sort the metric values in descending order to easily pick the largest ones.
    initialMetricPool.sort((valA, valB) => valB - valA);

    // Truncate the metric pool to the `maximumMetricCount` specified.
    // Using `.slice()` creates a new array, preserving the original `initialMetricPool` if needed.
    const currentAvailableMetrics = initialMetricPool.slice(0, maximumMetricCount);

    // --- Grouping and Ordering Geometric Pairs ---

    // Utilize a Map to group geometric pairs based on their first component.
    // A Map is chosen here for potentially clearer semantic intent over a plain object.
    const componentGroupings = new Map();

    for (const individualPair of validatedGeometricPairs) {
        const primaryComponentIdentifier = individualPair[0];
        if (!componentGroupings.has(primaryComponentIdentifier)) {
            componentGroupings.set(primaryComponentIdentifier, []);
        }
        componentGroupings.get(primaryComponentIdentifier).push(individualPair);
    }

    // Convert the Map's values (arrays of grouped pairs) into a flat array of collections.
    const collectionsOfGroupedPairs = Array.from(componentGroupings.values());

    // Sort these collections. Here, we sort in descending order of their length,
    // meaning groups with more associated pairs will appear earlier.
    collectionsOfGroupedPairs.sort((collectionOne, collectionTwo) => collectionTwo.length - collectionOne.length);

    // Flatten the sorted collections back into a single, ordered list of geometric pairs.
    // The `flat()` method is a concise way to achieve this.
    const finalOrderedGeometricPairs = collectionsOfGroupedPairs.flat();

    // --- Core Calculation Logic ---

    let accumulatedSumTotal = 0;
    // A Map to store which metric value has been assigned to each unique component identifier.
    const assignedComponentMetrics = new Map();
    // Create a mutable copy of the available metrics to consume them during assignment.
    const metricsForAssignmentQueue = [...currentAvailableMetrics];

    // Helper function to get a metric for a component, assigning one from the queue if not already assigned.
    const retrieveOrAllocateMetric = (componentKey) => {
        if (!assignedComponentMetrics.has(componentKey)) {
            const nextMetricFromQueue = metricsForAssignmentQueue.shift();
            if (nextMetricFromQueue === undefined) {
                // Critical check: if we run out of metrics, we cannot proceed with new assignments.
                // This indicates an imbalance between the number of unique components and available metrics.
                console.error(`Error: Ran out of available metrics while trying to assign to component '${componentKey}'. Calculation may be incomplete.`);
                return 0; // Return a default value (e.g., 0) or throw an error to halt execution.
            }
            assignedComponentMetrics.set(componentKey, nextMetricFromQueue);
        }
        return assignedComponentMetrics.get(componentKey);
    };

    // Iterate through the carefully ordered geometric pairs.
    for (const currentPair of finalOrderedGeometricPairs) {
        const [componentA, componentB] = currentPair;

        // Obtain or assign a metric for both components of the current pair.
        const metricForComponentA = retrieveOrAllocateMetric(componentA);
        const metricForComponentB = retrieveOrAllocateMetric(componentB);

        // Add the minimum of the two assigned metrics to the running total.
        accumulatedSumTotal += Math.min(metricForComponentA, metricForComponentB);
    }

    // --- Output Generation ---
    // Construct the final output string as required.
    const formattedOutputResult = `${accumulatedSumTotal}\n${currentAvailableMetrics.join(" ")}`;
    console.log(formattedOutputResult);
}

// --- Entry Point ---
// This block handles reading input from stdin and invoking the main processing function.
try {
    const fileSystemModule = require("fs");
    const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    processInputData(standardInputContent);
} catch (executionError) {
    console.error("An unexpected error occurred during program execution:", executionError.message);
    // Log additional details if available, e.g., stack trace.
    // console.error(executionError.stack);
}