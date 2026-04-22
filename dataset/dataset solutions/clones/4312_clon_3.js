const processInputData = (rawDataString) => {
    // Comments:
    // This function analyzes a given string of data to determine if a specific sequence
    // of numerical targets can be found within and sequentially "consumed" from a main dataset.
    // It simulates a "subsequence matching with consumption" scenario.

    // Step 1: Divide the raw input string into distinct lines.
    // Using a regex for split ensures compatibility with different newline conventions (LF, CRLF).
    const parsedInputLines = rawDataString.split(/\r?\n/);

    // Note: The first line of input (parsedInputLines[0]) which might represent a count
    // (like 'N' in the original problem context) is not used in the core logic.
    // It's intentionally omitted here as a non-essential statement deletion.

    // Step 2: Extract and prepare the primary numerical dataset.
    // The second line contains space-separated numbers for the main dataset.
    // Each string number is converted to an integer with an explicit radix (base 10) for safety.
    // The dataset is then sorted numerically in ascending order.
    let primaryNumberSet = parsedInputLines[1]
        .split(' ')
        .map(numericString => Number.parseInt(numericString, 10))
        .sort((valA, valB) => valA - valB); // Ensure proper numeric sort, not lexicographical.

    // Step 3: Determine the required number of matches from the target sequence.
    // The third line provides the count of elements to process from the target sequence.
    const requiredMatchCount = Number.parseInt(parsedInputLines[2], 10);

    // Step 4: Extract and prepare the target numerical sequence.
    // The fourth line contains space-separated numbers for the target sequence.
    // Similar to the primary dataset, elements are parsed as integers and sorted numerically.
    let candidateMatchSequence = parsedInputLines[3]
        .split(' ')
        .map(numericString => Number.parseInt(numericString, 10))
        .sort((valA, valB) => valA - valB); // Ensure proper numeric sort.

    // Initialize a flag to track the overall success of the matching process.
    let isMatchingProcessSuccessful = true;

    // Step 5: Begin the core matching loop.
    // This loop iterates for the `requiredMatchCount` times, attempting to find and consume
    // each target element from the `candidateMatchSequence` in the `primaryNumberSet`.
    for (let currentIteration = 0; currentIteration < requiredMatchCount; ++currentIteration) {
        // Retrieve the next target element from the front of the candidate sequence.
        // `shift()` modifies the array in place, removing the first element.
        const currentTargetElement = candidateMatchSequence.shift();

        // A flag to indicate if the `currentTargetElement` was found in `primaryNumberSet`
        // during the current iteration.
        let wasElementFoundInDataset = false;

        // Guard clause: If the candidate sequence runs out of elements prematurely
        // (i.e., `requiredMatchCount` is greater than the initial length of `candidateMatchSequence`),
        // then `currentTargetElement` will be `undefined`. This signifies a failure.
        if (typeof currentTargetElement === 'undefined') {
            isMatchingProcessSuccessful = false;
            break; // Exit the main loop early as success is no longer possible.
        }

        // Step 5.1: Search for the `currentTargetElement` within the `primaryNumberSet`.
        // The loop dynamically checks `primaryNumberSet.length` as it can change.
        for (let datasetElementIndex = 0; datasetElementIndex < primaryNumberSet.length; ++datasetElementIndex) {
            if (currentTargetElement === primaryNumberSet[datasetElementIndex]) {
                // If a match is found:
                // "Consume" the matched element and all elements preceding it from the dataset.
                // This is achieved by reassigning `primaryNumberSet` to a slice starting
                // from the element *after* the matched one.
                primaryNumberSet = primaryNumberSet.slice(datasetElementIndex + 1);
                wasElementFoundInDataset = true;
                break; // Stop searching for this target element in the dataset.
            }
        }

        // Step 5.2: Check if the `currentTargetElement` was successfully found.
        // If not, the overall matching process fails.
        if (!wasElementFoundInDataset) {
            isMatchingProcessSuccessful = false;
            break; // Exit the main loop early as success is no longer possible.
        }
    }

    // Step 6: Output the final outcome.
    // The result is 'Yes' if all required target elements were successfully found and consumed,
    // otherwise, it's 'No'.
    console.log(isMatchingProcessSuccessful ? 'Yes' : 'No');

    // Step 7: The function returns 0, mirroring the original function's return value.
    return 0;
};

// Entry point for execution:
// Reads input from standard input, removes leading/trailing whitespace,
// and passes it to the `processInputData` function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());