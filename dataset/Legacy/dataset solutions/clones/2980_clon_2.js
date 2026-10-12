// This function serves as the primary entry point for processing input data.
function processInput(rawData) {
    // The input string is split into an array of string arguments based on spaces.
    const inputArguments = rawData.split(' ');

    // Each argument is parsed into an integer, using base 10 for numerical conversion.
    let redComponentValue = Number.parseInt(inputArguments[0], 10);
    let greenComponentValue = Number.parseInt(inputArguments[1], 10);
    let blueComponentValue = Number.parseInt(inputArguments[2], 10);
    let targetTotalSum = Number.parseInt(inputArguments[3], 10);

    // An array is created from the component values and then sorted.
    // Note: JavaScript's default sort for numbers without a comparator sorts lexicographically.
    // This behavior is preserved from the original code.
    const sortedComponentValues = [redComponentValue, greenComponentValue, blueComponentValue].sort();

    // Calculate the maximum possible count for each component based on the target sum
    // and the smallest value in the sorted array.
    // These variables are declared but not all are directly used in the loop bounds later.
    const maximumRedIterations = Math.floor(targetTotalSum / sortedComponentValues[0]);
    const maximumGreenIterations = Math.floor(targetTotalSum / sortedComponentValues[1]);
    const maximumBlueIterations = Math.floor(targetTotalSum / sortedComponentValues[2]);

    // Initialize a counter to keep track of valid combinations.
    let validCombinationCount = 0;

    // Outer loop iterates through possible counts for the 'red' component.
    // The upper bound is determined by the maximum possible count for the smallest component.
    for (let redIterator = 0; redIterator <= maximumRedIterations; redIterator++) {
        // Check if the 'red' component alone can perfectly match the target sum.
        if (redIterator * redComponentValue === targetTotalSum) {
            validCombinationCount++; // If so, increment the counter.
            continue;                // Skip to the next 'red' iteration as no other components are needed.
        }

        // Middle loop iterates through possible counts for the 'green' component.
        // The upper bound is dynamically calculated based on the remaining sum after accounting for 'red'.
        for (let greenIterator = 0; greenIterator * greenComponentValue <= targetTotalSum - redIterator * redComponentValue; greenIterator++) {
            // Check if 'red' and 'green' components together perfectly match the target sum.
            if (redIterator * redComponentValue + greenComponentValue * greenIterator === targetTotalSum) {
                validCombinationCount++; // If so, increment the counter.
                continue;                // Skip to the next 'green' iteration as no 'blue' component is needed.
            }

            // Inner loop iterates through possible counts for the 'blue' component.
            // The upper bound is dynamically calculated based on the remaining sum after 'red' and 'green'.
            for (let blueIterator = 0; blueIterator * blueComponentValue <= targetTotalSum - redIterator * redComponentValue - greenComponentValue * greenIterator; blueIterator++) {
                // Check if all three components combined perfectly match the target sum.
                if (redComponentValue * redIterator + greenComponentValue * greenIterator + blueComponentValue * blueIterator === targetTotalSum) {
                    validCombinationCount++; // If so, increment the counter.
                }
            }
        }
    }

    // Print the final count of valid combinations to the console.
    console.log(validCombinationCount);
}

// The program starts by reading input from standard input, decoding it as UTF-8,
// and then passing it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
