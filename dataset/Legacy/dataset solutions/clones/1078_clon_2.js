/**
 * Processes an array of numbers to calculate a specific sum based on cycles.
 * This function identifies cycles formed by mapping elements to their sorted positions
 * and calculates a cost for each cycle, then sums these costs.
 *
 * @param {number[]} inputNumbers The array of integers to be processed.
 * @param {number} arrayLength The number of elements in the input array.
 * @returns {number} The final calculated sum.
 */
function processArray(inputNumbers, arrayLength) {
    let finalResult = 0; // Accumulator for the total calculated sum.

    // Data structures for cycle detection and mapping.
    const visitedFlags = [];     // Boolean array to mark elements visited during cycle traversal.
    const orderedElements = [];  // A copy of the input array, which will be sorted.
    const elementIndexMap = [];  // Maps each unique number to its index in the sorted array.

    // Find the overall minimum value in the input array.
    // This is used in one of the cost calculation formulas.
    const overallMinimum = Math.min(...inputNumbers);

    // Initialize `orderedElements` with `inputNumbers` and `visitedFlags` to all false.
    for (let idx = 0; idx < arrayLength; idx++) {
        orderedElements[idx] = inputNumbers[idx];
        visitedFlags[idx] = false;
    }

    // Sort the `orderedElements` array numerically.
    orderedElements.sort((first, second) => first - second);

    // Populate the `elementIndexMap`.
    // For each number in the sorted array, store its index.
    // This allows quick lookup of an element's sorted position.
    for (let idx = 0; idx < arrayLength; idx++) {
        elementIndexMap[orderedElements[idx]] = idx;
    }

    // Iterate through the original array to find and process cycles.
    for (let idx = 0; idx < arrayLength; idx++) {
        // If the current element has already been visited (i.e., part of a previously processed cycle), skip it.
        if (visitedFlags[idx]) {
            continue;
        }

        // Start a new cycle traversal.
        let currentPosition = idx;      // The current index in the cycle.
        let cycleSum = 0;               // Sum of all elements in the current cycle.
        let cycleMinimum = 1000000001;  // Minimum element found in the current cycle (initialized to a large value).
        let cycleCount = 0;             // Number of elements in the current cycle.

        // Traverse the cycle until a previously visited element is encountered.
        while (true) {
            visitedFlags[currentPosition] = true; // Mark the current element as visited.
            cycleCount++;                         // Increment the count of elements in this cycle.

            const currentValue = inputNumbers[currentPosition]; // Get the value at the current position.

            cycleMinimum = Math.min(cycleMinimum, currentValue); // Update the minimum value for this cycle.
            cycleSum += currentValue;                            // Add the value to the cycle's sum.

            // Move to the next element in the cycle:
            // The next position is determined by the sorted index of the current value.
            currentPosition = elementIndexMap[currentValue];

            // If the next element has already been visited, the cycle is complete.
            if (visitedFlags[currentPosition]) {
                break;
            }
        }

        // Calculate the cost for the current cycle and add it to the total result.
        // There are two ways to calculate the cost, and we choose the minimum of the two.
        // Formula 1: (Sum of cycle elements) + (Number of elements - 2) * (Minimum element in cycle)
        // Formula 2: (Minimum element in cycle) + (Sum of cycle elements) + (Number of elements + 1) * (Overall minimum element)
        finalResult += Math.min(
            cycleSum + (cycleCount - 2) * cycleMinimum,
            cycleMinimum + cycleSum + (cycleCount + 1) * overallMinimum
        );
    }

    return finalResult; // Return the accumulated final result.
}

/**
 * Main function to read input, process it, and print the result.
 *
 * @param {string} inputDataString The raw input string from stdin.
 */
function executeProgram(inputDataString) {
    // Split the input string into an array of lines.
    const inputLines = inputDataString.split('\n');

    // Parse the first line to get the array length.
    const arrayLength = parseInt(inputLines.shift(), 10);

    // Parse the second line to get the sequence of numbers.
    // It splits the line by spaces and converts each part to an integer.
    const numberSequence = inputLines.shift().split(' ').map(element => parseInt(element, 10));

    // Call the core processing function with the parsed data.
    const calculatedAnswer = processArray(numberSequence, arrayLength);

    // Output the final calculated answer to the console.
    console.log(calculatedAnswer);
}

// Read input from standard input and execute the program.
executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
