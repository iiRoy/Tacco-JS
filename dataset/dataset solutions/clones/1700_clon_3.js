// This module provides a function designed to process a specific format of incoming data,
// performing a sequence of numerical transformations and aggregations.
function processInputData(rawDataString) {
    // Step 1: Deconstruct the raw input string into manageable lines.
    // We assume the input is newline-separated, where each line holds distinct information.
    const inputLines = rawDataString.split("\n");

    // Step 2: Extract the primary count from the first line.
    // The first line is expected to contain a single numeric value indicating the total number of items to process.
    // The unary plus operator (`+`) is used for a quick string-to-number conversion.
    const totalItemCount = +inputLines[0];

    // Type III Addition: Introduce a guard clause for input validation.
    // If the extracted count is not a valid number or is non-positive,
    // we consider it an empty or invalid dataset and output zero as the aggregated result.
    // This is a more robust handling than letting `undefined` or `NaN` propagate, common in real-world scenarios.
    if (isNaN(totalItemCount) || totalItemCount <= 0) {
        console.log(0); // For empty or invalid counts, the sum is zero.
        return;         // Terminate execution early.
    }

    // Step 3: Parse the sequence of numbers from the second line.
    // The second line consists of space-separated numeric strings.
    // We first split this line into an array of string tokens.
    const stringValueTokens = inputLines[1].split(" ");

    // Convert these string tokens into an array of actual numeric values.
    // We use `Array.prototype.map` for a functional transformation,
    // and `slice(0, totalItemCount)` ensures we only process the relevant number of elements,
    // aligning with the problem's implicit boundary defined by `totalItemCount`.
    const initialNumericValues = stringValueTokens.slice(0, totalItemCount).map(strVal => +strVal);

    // Step 4: Generate a new collection by duplicating each initial numeric value.
    // Each number from `initialNumericValues` will appear twice in the new collection.
    // `flatMap` provides an elegant and efficient way to achieve both mapping and flattening in one operation.
    const duplicatedValuesCollection = initialNumericValues.flatMap(numValue => [numValue, numValue]);

    // Step 5: Arrange the duplicated values in a specific order.
    // The collection needs to be sorted in descending order (from largest to smallest).
    // The comparison function `(b - a)` is a standard concise method for descending numeric sort.
    duplicatedValuesCollection.sort((valA, valB) => valB - valA);

    // Step 6: Compute the final aggregated sum based on specific elements from the sorted collection.
    // The calculation logic involves taking the largest element, skipping the second largest,
    // and then summing elements from the third largest up to the (totalItemCount)-th largest.
    let finalAggregatedResult = 0;

    // Type III Addition: Implement conditional logic for different `totalItemCount` scenarios.
    // This makes the flow for edge cases (like `totalItemCount = 1`) more explicit.
    if (totalItemCount === 1) {
        // If there's only one item, the sum is simply the largest value.
        finalAggregatedResult = duplicatedValuesCollection[0];
    } else { // This block executes for `totalItemCount > 1`.
        // Initialize the sum with the first (largest) element as per the original logic.
        finalAggregatedResult = duplicatedValuesCollection[0];

        // Type III Update: Re-structure the loop for summation.
        // Iterate from the third element (index 2) up to, but not including, `totalItemCount`.
        // This precisely replicates the original loop's boundaries (`for (var i = 2; i < n; i++)`).
        for (let currentElementIndex = 2; currentElementIndex < totalItemCount; currentElementIndex++) {
            // Type III Addition: Include a defensive check to prevent out-of-bounds access.
            // Although `duplicatedValuesCollection` typically contains `2 * totalItemCount` elements,
            // this guard enhances robustness against unexpected data or logic variations.
            if (currentElementIndex < duplicatedValuesCollection.length) {
                finalAggregatedResult += duplicatedValuesCollection[currentElementIndex];
            } else {
                // If we somehow exceed the array bounds before `totalItemCount` is reached,
                // it's safer to break the loop.
                break;
            }
        }
    }

    // Step 7: Display the final computed aggregated value.
    // The result is outputted to the standard console.
    console.log(finalAggregatedResult);
}

// This is the entry point for executing the script in a typical competitive programming environment.
// It reads all data from standard input (usually `/dev/stdin` on Linux-like systems)
// as a UTF-8 encoded string and then passes it to our primary processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));