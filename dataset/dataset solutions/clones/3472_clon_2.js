let numberBank; // This array will store and manipulate numeric values.

/**
 * Performs a specific set of operations on two elements within the 'numberBank'.
 * The source element's value is modified and then added to the destination element.
 *
 * @param {number} sourceIdx - The index of the element to be modified and used as source.
 * @param {number} destIdx   - The index of the element where the modified source value will be added.
 */
function processValues(sourceIdx, destIdx) {
    // If the value at the source index is an odd number, decrement it by one.
    if (numberBank[sourceIdx] % 2 === 1) {
        numberBank[sourceIdx]--;
    }

    // Halve the value at the source index.
    numberBank[sourceIdx] /= 2;

    // Add the (now modified) source value to the destination value.
    numberBank[destIdx] += numberBank[sourceIdx];
}

/**
 * The primary function that orchestrates the data processing.
 * It initializes the number bank, performs a series of operations in a loop,
 * and then outputs the final state of key elements.
 *
 * @param {string} inputData - The raw string input, expected to contain numbers.
 */
function executeMainLogic(inputData) {
    // Parse the initial data:
    // 1. Split the input string by newlines and take the first line.
    // 2. Split that line by any whitespace characters to get individual number strings.
    // 3. Convert each string element into a numeric type.
    // 4. Assign this resulting array of numbers to our global 'numberBank'.
    numberBank = inputData.split('\n')[0].split(/\s+/).map(function(itemStr) {
        return Number(itemStr);
    });

    // The third element (index 2) in the initialized numberBank
    // determines the total number of iterations for the main loop.
    let maxRounds = numberBank[2];

    // Iterate for the specified number of rounds.
    for (let roundNumber = 1; roundNumber <= maxRounds; roundNumber++) {
        // Based on whether the current round number is odd or even,
        // call the 'processValues' function with different index pairs.
        if (roundNumber % 2 === 1) {
            // If the round number is odd, operate on elements at index 0 and 1.
            processValues(0, 1);
        } else {
            // If the round number is even, operate on elements at index 1 and 0.
            processValues(1, 0);
        }
    }

    // After all iterations are complete, print the final values
    // of the first two elements from the number bank to the console.
    console.log("Final Values: %d %d", numberBank[0], numberBank[1]);
}

// Read the input from the standard input stream (e.g., a file or piped data)
// and then invoke the main processing function with this data.
executeMainLogic(require("fs").readFileSync("/dev/stdin", "utf8"));