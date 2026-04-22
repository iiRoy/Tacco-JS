/**
 * Processes a given input string to determine a specific condition.
 * @param {string} rawData The raw string data to be processed.
 */
function analyzeDataSet(rawData) {
    const parsedLines = rawData.split('\n');
    let itemCount = Number(parsedLines[0]);
    let numericStrings = parsedLines[1].split(' ');

    let largestValue = 0;
    let totalSum = 0;

    for (let currentIndex = 0; currentIndex < itemCount; currentIndex++) {
        // Convert current string element to a numeric type
        const currentValue = Number(numericStrings[currentIndex]);

        // Check if this value is the new maximum
        if (largestValue < currentValue) {
            largestValue = currentValue;
        }

        // Accumulate the current value to the total sum
        totalSum += currentValue;
    }

    // Evaluate the final condition based on the computed values
    if (largestValue < (totalSum - largestValue)) {
        console.log('Yes'); // Output for the "true" case
    } else {
        console.log('No');  // Output for the "false" case
    }
}

// Read input from standard input and pass it to the processing function
analyzeDataSet(require('fs').readFileSync('/dev/stdin', 'utf8'));