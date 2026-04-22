function ProcessInputData(rawDataLines) {
    // --- Input Parsing and Initial Data Preparation ---

    // Deconstruct the first line to get the primary count and the cost threshold.
    // Ensure explicit conversion from string to integer for numerical operations.
    const headerInfo = rawDataLines[0].split(' ');
    const itemCount = parseInt(headerInfo[0], 10);
    const maxCostThreshold = parseInt(headerInfo[1], 10);

    // Process the second line for base item values.
    // Utilize `map(Number)` for concise string-to-number conversion.
    const baseItemValues = rawDataLines[1].split(' ').map(Number);

    // Process the third line for factor weights.
    // Again, `map(Number)` ensures numerical array elements.
    const factorWeights = rawDataLines[2].split(' ').map(Number);

    // --- Input Validation (Type III Addition: Guard Clause) ---
    // A basic check to ensure data consistency before proceeding.
    if (itemCount <= 0 || baseItemValues.length !== itemCount || factorWeights.length !== itemCount) {
        // In a real application, this might throw an error or log a warning.
        // For this context, we'll return a sentinel value indicating an issue.
        console.error("Data integrity check failed: Item count mismatch or invalid count.");
        return -1;
    }

    // --- Data Sorting for Optimized Calculation ---

    // Sort the base item values in descending order.
    // This helps in pairing larger base values with smaller factors later.
    baseItemValues.sort((firstElement, secondElement) => secondElement - firstElement);

    // Sort the factor weights in ascending order.
    // This ensures that smaller factors (which lead to larger penalties)
    // are paired with the larger base values from the `baseItemValues` array.
    factorWeights.sort((firstElement, secondElement) => firstElement - secondElement);

    // --- Binary Search for the Optimal Cost Parameter ---

    // Define the search range for the cost parameter.
    // `lowerSearchBound` is the minimum possible effective cost (starts at 0).
    // `upperSearchBound` is a sufficiently large maximum possible cost value.
    // A typical maximum for A[i] is 10^9, so a value like 2 * 10^9 covers most cases.
    const MAX_POSSIBLE_PARAM_VALUE = 2 * 10**9 + 7; // Added a small offset for robustness.
    let lowerSearchBound = 0.0;
    let upperSearchBound = MAX_POSSIBLE_PARAM_VALUE;

    // For floating-point binary search, iterating a fixed number of times
    // is often preferred over an epsilon-based check to guarantee precision.
    const BINARY_SEARCH_ITERATIONS = 100;

    for (let currentIteration = 0; currentIteration < BINARY_SEARCH_ITERATIONS; ++currentIteration) {
        // Calculate the midpoint (potential cost parameter) for the current search interval.
        const currentCostMidpoint = (lowerSearchBound + upperSearchBound) / 2.0;

        // Calculate the total penalty incurred with the `currentCostMidpoint`.
        let accumulatedPenalty = 0.0;
        for (let itemIndex = 0; itemIndex < itemCount; ++itemIndex) {
            // Calculate the individual penalty for each item.
            // The penalty is `max(baseValue - costMidpoint / factorWeight, 0)`.
            // We use `Math.max` to ensure the penalty is never negative.
            const itemSpecificPenalty = baseItemValues[itemIndex] - (currentCostMidpoint / factorWeights[itemIndex]);
            accumulatedPenalty += Math.max(itemSpecificPenalty, 0.0);
        }

        // Adjust the search bounds based on the comparison with the maximum allowed threshold.
        if (accumulatedPenalty <= maxCostThreshold) {
            // If the total penalty is within limits, it means `currentCostMidpoint`
            // is achievable or too high. We try to find a smaller or equal value.
            upperSearchBound = currentCostMidpoint;
        } else {
            // If the total penalty exceeds limits, `currentCostMidpoint` is too low.
            // We need to increase the cost parameter to reduce the penalty.
            lowerSearchBound = currentCostMidpoint;
        }
    }

    // After the binary search, `upperSearchBound` will hold the minimal cost parameter
    // that satisfies the condition. The problem implicitly asks for this value.
    // Rounding down is common if an integer result is expected, but for floating point
    // problems, the raw float is often the answer. Here, we'll floor it based on typical contest problems.
    return Math.floor(upperSearchBound);
}

// --- Application Execution Entry Point ---

// Read the entire standard input asynchronously, decode as UTF-8,
// and split it into an array of lines.
const rawInputLines = require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .split("\n");

// Call the main processing function with the parsed input.
const finalOptimalResult = ProcessInputData(rawInputLines);

// Output the calculated final optimal cost to standard output.
console.log(finalOptimalResult);