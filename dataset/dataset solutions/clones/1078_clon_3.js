function parseIntegerSafely(inputString) {
    const parsedValue = parseInt(inputString, 10);
    // Returns the parsed integer or NaN if parsing fails.
    // This helper ensures robust number conversion.
    return isNaN(parsedValue) ? Number.NaN : parsedValue;
}

function calculateMinSwaps(inputSequence, sequenceLength) {
    // Guard clause: If the input sequence is null/undefined or has an invalid length,
    // there's no cost associated with sorting, so return 0.
    if (!inputSequence || sequenceLength <= 0) {
        return 0;
    }

    let accumulatedSwapCost = 0; // This variable will store the total minimum cost.

    // Create a mutable copy of the input sequence for sorting.
    // Using the spread operator provides a clean shallow copy.
    const sortedValuesReference = [...inputSequence];

    // Initialize a boolean array to keep track of elements that have already been
    // visited and processed as part of a cycle. All elements start as unprocessed.
    const visitedIndicesTracker = new Array(sequenceLength).fill(false);

    // Explicitly find the overall minimum value in the original sequence.
    // This is used in one of the cost calculation formulas.
    let globalMinimumValue = Number.MAX_SAFE_INTEGER;
    for (let currentElementIndex = 0; currentElementIndex < sequenceLength; currentElementIndex++) {
        if (inputSequence[currentElementIndex] < globalMinimumValue) {
            globalMinimumValue = inputSequence[currentElementIndex];
        }
    }

    // Sort the copied array to determine the correct, final positions of each value.
    sortedValuesReference.sort((a, b) => a - b);

    // Construct a mapping from each unique value to its correct sorted index.
    // Using a JavaScript Map object provides a more flexible and robust
    // way to handle keys (values from the sequence) compared to a sparse array,
    // especially if values could be large or non-contiguous.
    const valueToSortedPositionMap = new Map();
    for (let k = 0; k < sequenceLength; k++) {
        valueToSortedPositionMap.set(sortedValuesReference[k], k);
    }

    // Iterate through each element of the original sequence to detect and process cycles.
    for (let initialCycleStartIdx = 0; initialCycleStartIdx < sequenceLength; initialCycleStartIdx++) {
        // If the element at this starting index has already been visited, it means
        // its cycle has already been computed and added to the total cost. Skip it.
        if (visitedIndicesTracker[initialCycleStartIdx]) {
            continue;
        }

        // Variables specific to the cycle currently being traversed.
        let currentCyclePointer = initialCycleStartIdx; // Index for traversing the current cycle.
        let currentCycleSum = 0;                     // Sum of all values encountered in this cycle.
        let currentCycleMinValue = Number.MAX_SAFE_INTEGER; // Smallest value within this cycle.
        let currentCycleElementCount = 0;            // Number of elements in this cycle.

        // Begin traversing the cycle. The loop continues indefinitely until
        // a previously visited element is encountered, indicating the cycle's completion.
        while (true) {
            // Mark the current element's index as visited to prevent re-processing
            // and to detect the cycle's closure.
            visitedIndicesTracker[currentCyclePointer] = true;

            // Retrieve the actual value from the input sequence at the current position.
            const elementValueInCycle = inputSequence[currentCyclePointer];

            // Update the statistics for the current cycle.
            currentCycleElementCount++;
            currentCycleMinValue = Math.min(currentCycleMinValue, elementValueInCycle);
            currentCycleSum += elementValueInCycle;

            // Determine the next element in the cycle. This is done by finding
            // where the current element's value *should* be in the sorted array.
            currentCyclePointer = valueToSortedPositionMap.get(elementValueInCycle);

            // If the next element we're supposed to visit has already been marked as visited,
            // it signifies that the cycle has completed its full traversal.
            if (visitedIndicesTracker[currentCyclePointer]) {
                break; // Exit the cycle traversal loop.
            }
        }

        // Calculate the cost for sorting the current cycle. There are two primary strategies:
        // Strategy A: Only use elements within the current cycle for swaps.
        // Cost = (sum of elements in cycle) + (number of elements - 2) * (minimum element in cycle)
        const strategyA_CycleCost = currentCycleSum + (currentCycleElementCount - 2) * currentCycleMinValue;

        // Strategy B: Utilize the overall global minimum element (from the entire input array).
        // This usually involves two extra swaps to temporarily bring the global min into the cycle
        // and then put it back.
        // Cost = (sum of elements in cycle) + (number of elements + 1) * (overall minimum element) + (minimum element in cycle)
        const strategyB_CycleCost = currentCycleSum + currentCycleMinValue + (currentCycleElementCount + 1) * globalMinimumValue;

        // Add the minimum cost between the two strategies to the total accumulated cost.
        accumulatedSwapCost += Math.min(strategyA_CycleCost, strategyB_CycleCost);
    }

    // Return the final computed minimum cost required to sort the array.
    return accumulatedSwapCost;
}

// Main execution block to handle input/output and orchestrate the process.
function executeProcessor(rawInputString) {
    // Split the entire input string by newline characters to get individual lines.
    const inputLines = rawInputString.split('\n');

    // Attempt to extract and parse the first line as the sequence length.
    const lengthString = inputLines.shift();
    const parsedArrayLength = parseIntegerSafely(lengthString);

    // Implement robust validation for the array length.
    if (isNaN(parsedArrayLength) || parsedArrayLength < 0) {
        console.error("Error: Invalid or non-positive sequence length provided.");
        return; // Exit if length is invalid.
    }
    if (parsedArrayLength === 0) {
        console.log(0); // If length is zero, cost is zero.
        return;
    }

    // Attempt to extract the second line, which should contain the numeric sequence.
    const sequenceValueString = inputLines.shift();
    if (!sequenceValueString) {
        console.error("Error: Numeric sequence line is missing from input.");
        return; // Exit if sequence line is missing.
    }

    // Parse the sequence string into an array of numbers.
    // Filter out any empty strings that might result from multiple spaces or trailing spaces.
    const numericInputSequence = sequenceValueString
        .split(' ')
        .filter(item => item.trim() !== '')
        .map(item => parseIntegerSafely(item));

    // Validate that all elements were successfully parsed and the sequence length matches.
    const containsInvalidNumbers = numericInputSequence.some(num => isNaN(num));
    if (containsInvalidNumbers || numericInputSequence.length !== parsedArrayLength) {
        console.error("Error: Sequence contains unparseable numbers or its actual length does not match the declared length.");
        return; // Exit if sequence is invalid.
    }

    // Invoke the core logic function to compute the minimum swap cost.
    const finalCalculatedResult = calculateMinSwaps(numericInputSequence, parsedArrayLength);

    // Output the final result to standard output.
    console.log(finalCalculatedResult);
}

// Entry point: Read input from standard input and pass it to the processor.
// This block handles the Node.js specific file system interaction.
try {
    const fileSystemHandler = require('fs');
    const standardInputContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');
    executeProcessor(standardInputContent);
} catch (ioError) {
    // Provide comprehensive error handling for file reading or initial processing failures.
    console.error("An unrecoverable error occurred during input reading or processing:", ioError.message);
    // In a production environment, one might also log the stack trace: console.error(ioError.stack);
    // Optionally, exit the process with an error code.
    // process.exit(1);
}