// This module is designed to process structured textual input data,
// performing a specific numerical calculation based on provided parameters.
// The primary goal is to determine a sum after filtering elements.
function ProcessInputData(rawDataString) {
    // --- Input Validation and Pre-processing ---
    // A robust check to ensure the input is a valid string and not empty.
    // This acts as a guard clause to prevent errors with malformed input.
    if (typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
        // In a production environment, one might throw a specific error or log it.
        // For competitive programming, returning 0 or printing an error might be sufficient.
        console.error("Error: The provided input data is either not a string or is entirely empty.");
        return; // Terminate execution as input is unusable.
    }

    // Split the entire block of input text into distinct lines.
    // Each line typically holds a different set of related data.
    const dataLines = rawDataString.split('\n');

    // Extracting and parsing the global parameters from the first line of input.
    // This line is expected to contain two space-separated integer values.
    const parameterStrings = dataLines[0].split(' ');
    // 'totalElementsCount' (N): Represents the overall number of data points.
    const totalElementsCount = Number(parameterStrings[0]);
    // 'removalCriterion' (K): Defines how many of the largest elements should be excluded from the sum.
    const removalCriterion = Number(parameterStrings[1]);

    // Extracting and parsing the individual numeric values from the second line.
    // These are the actual data points that will be processed.
    const rawNumericStrings = dataLines[1].split(' ');
    // Convert all string representations into actual floating-point numbers.
    // Using `map` for a concise and functional transformation.
    const numericValuesCollection = rawNumericStrings.map(valueStr => Number(valueStr));

    // --- Core Logic: Conditional Summation ---

    // A critical decision point: If the total number of elements is less than or
    // equal to the removal criterion, it implies that all elements would be
    // considered "removed" or are not sufficient to meet the criterion for summation.
    // In such a case, the resulting sum of remaining elements is logically zero.
    if (totalElementsCount <= removalCriterion) {
        console.log('0');
        return; // Exit the function immediately after printing the trivial result.
    }

    // If the number of elements is greater than the removal criterion,
    // we proceed with the actual calculation.
    // Step 1: Sort the collection of numeric values in descending order.
    // This arranges elements from largest to smallest, making it easy to
    // identify and exclude the top 'removalCriterion' (minus one) values.
    numericValuesCollection.sort((valueA, valueB) => valueB - valueA);

    // Step 2: Determine which elements to include in the final sum.
    // Based on the original problem's logic, we sum elements starting from
    // the (K-1)-th index (0-based) to the end of the sorted array.
    // This effectively excludes the K-1 largest elements.
    const elementsToSum = numericValuesCollection.slice(removalCriterion - 1);

    // Step 3: Calculate the sum of the selected elements.
    // The `reduce` method is used for an efficient and functional summation.
    // The initial value for the accumulator is set to 0.
    const finalComputedResult = elementsToSum.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // --- Output ---
    // Print the final calculated numerical result to the standard output.
    console.log(finalComputedResult);
}

// --- Standard Environment Hook (Do Not Modify) ---
// This section is standard boilerplate for executing JavaScript code
// in a Node.js environment, typically used in competitive programming.
// It reads the entire content from standard input and passes it to
// the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));