// Helper function to reliably convert a string representation into an integer.
// This ensures that the parsing always uses base-10.
function stringToInteger(stringValue) {
    // Utilizing parseInt with the radix parameter for explicit base-10 conversion.
    // This is a robust way to handle string-to-number transformations.
    return parseInt(stringValue, 10);
}

// Utility function designed to transform an array of string-based numbers
// into an array where each element is an actual numerical value.
// It leverages the stringToInteger helper for individual conversions.
function convertStringsToNumbers(stringArray) {
    // The Array.prototype.map method is employed here to apply the
    // stringToInteger function to every single item within the input array,
    // thereby yielding a new array composed entirely of numbers.
    return stringArray.map(item => stringToInteger(item));
}

// The primary entry point for the application's execution flow.
// This block is responsible for reading the input data from a designated source (stdin)
// and subsequently invoking the main processing function with the acquired content.
// This setup is typical for environments like competitive programming platforms.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Orchestrates the entire data processing workflow, from initial parsing
 * and validation of input to the final calculation and output.
 * This function embodies the core logic of the problem solution.
 *
 * @param {string} inputStringContent - The complete raw string data received from the input source.
 */
function ProcessInputData(inputStringContent) {
    // --- Phase 1: Input Parsing and Comprehensive Validation ---

    // A preliminary check to ensure that the provided input is neither empty nor solely whitespace.
    // If the input is invalid, an error message is logged, and the function terminates early.
    if (!inputStringContent || inputStringContent.trim().length === 0) {
        console.error("Critical Error: The input content provided is either null, undefined, or empty.");
        return; // Halts execution due to invalid input.
    }

    // The entire input string is segmented into an array of individual lines.
    // 'const' is used as this array reference itself will not be reassigned.
    const rawLineSegments = inputStringContent.split('\n');

    // Validation to confirm that the input contains the minimum expected number of lines.
    // The problem structure typically requires at least two lines for parameters and data.
    if (rawLineSegments.length < 2) {
        console.error("Input Structure Error: Insufficient number of lines detected. A minimum of 2 lines is mandatory.");
        return;
    }

    // The first line of input is parsed to extract key numerical parameters.
    const firstLineTokens = rawLineSegments[0].split(' ');
    // These string tokens are then converted into their corresponding numerical values.
    const initialParameters = convertStringsToNumbers(firstLineTokens);

    // Destructuring assignment is used here for enhanced readability,
    // mapping generic array elements to semantically meaningful variable names.
    // 'elementCount' corresponds to 'n', and 'baseCost' corresponds to 'x' from the original problem.
    const elementCount = initialParameters[0];
    const baseCost = initialParameters[1];

    // Rigorous validation for 'elementCount': it must be a positive integer.
    // Non-positive or non-integer counts are considered erroneous.
    if (elementCount <= 0 || !Number.isInteger(elementCount)) {
        console.error("Parameter Error: The declared element count must be a strictly positive integer value.");
        return;
    }

    // The second line of input is processed to obtain the array of data points.
    const secondLineTokens = rawLineSegments[1].split(' ');
    // Similar to the first line, these string tokens are converted to numbers.
    const dataPoints = convertStringsToNumbers(secondLineTokens);

    // A crucial check to ensure consistency: the actual number of data points
    // must precisely match the 'elementCount' declared in the first line.
    if (dataPoints.length !== elementCount) {
        console.error(`Data Consistency Error: Mismatch detected between the declared element count (${elementCount}) ` +
                      `and the actual number of provided data points (${dataPoints.length}).`);
        return;
    }

    // --- Phase 2: Prefix Sums / Cumulative Totals Calculation ---

    // An array is initialized to store the cumulative sums (prefix sums) of the 'dataPoints'.
    // Pre-allocating the array size can offer minor performance benefits.
    const cumulativeTotals = new Array(elementCount);

    // The first element of the cumulative totals array is simply the first data point itself.
    // This serves as the base case for the prefix sum calculation.
    cumulativeTotals[0] = dataPoints[0];

    // An iterative process to compute the remaining prefix sums.
    // Each cumulative total is the sum of the current data point and the preceding cumulative total.
    for (let currentIdx = 1; currentIdx < elementCount; ++currentIdx) {
        cumulativeTotals[currentIdx] = dataPoints[currentIdx] + cumulativeTotals[currentIdx - 1];
    }

    // --- Phase 3: Core Algorithmic Calculation ---

    // The variable to hold the final computed total is initialized.
    // Its starting value is derived from the problem's initial conditions: (N+1)*X.
    let computedTotal = (elementCount + 1) * baseCost;

    // A counter specifically designed to track the length of the current sequence
    // or segment being evaluated within the main loop.
    let segmentCounter = 0;

    // The primary loop iterates through the 'dataPoints' array in reverse order,
    // starting from the last element and proceeding towards the first.
    for (let reverseIdx = elementCount - 1; reverseIdx >= 0; --reverseIdx) {
        // Increment the segment counter for each element processed in this reverse traversal.
        segmentCounter++;

        // A temporary constant is introduced for the current data point's value
        // to enhance the readability of subsequent complex calculations.
        const currentDataPointValue = dataPoints[reverseIdx];

        // The complex conditional logic is broken down into more manageable and understandable parts.
        // This corresponds to the original condition: 'has<3 || ss[i]*(has-1)*2 - xs[i]*2 < x'
        const isSegmentLengthLessThanThree = (segmentCounter < 3);
        const derivedValueFromCumulativeSum = (cumulativeTotals[reverseIdx] * (segmentCounter - 1) * 2) - (currentDataPointValue * 2);
        const isDerivedValueBelowBaseCost = (derivedValueFromCumulativeSum < baseCost);

        // Based on the evaluated conditions, one of two calculation branches is executed.
        if (isSegmentLengthLessThanThree || isDerivedValueBelowBaseCost) {
            // This branch corresponds to the original 'ans += xs[i]*(max(has,2)*2 + 1)' logic.
            // Math.max is directly used for determining the larger of two values.
            const dynamicMultiplierBase = Math.max(segmentCounter, 2);
            // The term to be added to the total is calculated in a clear, step-by-step manner.
            const termToAdd = currentDataPointValue * ((dynamicMultiplierBase * 2) + 1);
            computedTotal += termToAdd;
        } else {
            // This alternative branch corresponds to the original 'has=1; ans += xs[i]*5 + x;' logic.
            // The segment counter is reset to 1, indicating the start of a new sequence.
            segmentCounter = 1;
            // The alternative term is computed and added to the running total.
            computedTotal += (currentDataPointValue * 5) + baseCost;
        }
    }

    // --- Phase 4: Output Result ---

    // The final calculated total is printed to the standard output.
    console.log(computedTotal);
}