function ProcessData(rawData) {
    // Divide the incoming string data into distinct lines
    const parsedLines = rawData.split('\n');

    // Extract relevant information from the very first line of input
    const firstLineTokens = parsedLines[0].split(' ');
    const itemCount = parseInt(firstLineTokens[0]);

    // Set up a collection of ten separate lists, initially empty
    let remainderBins = new Array(10);
    for (let binInitializerIndex = 0; binInitializerIndex < remainderBins.length; binInitializerIndex++) {
        remainderBins[binInitializerIndex] = [];
    }

    // A temporary holder for the current numeric value being processed
    let currentValue = 0;

    // An accumulator for the running total of all numbers
    let totalSum = 0;

    // A variable to keep track of the smallest number encountered that does not end in zero
    let smallestNonZeroEnding = 1000;

    // Iterate through each data entry starting from the second line of the input
    for (let entryIndex = 0; entryIndex < itemCount; entryIndex++) {
        // Convert the current line's data to an integer
        currentValue = parseInt(parsedLines[entryIndex + 1]);
        totalSum += currentValue; // Add this number to the grand total

        // Evaluate if this number is a new candidate for the smallest number not ending in zero
        if (currentValue < smallestNonZeroEnding && (currentValue % 10 !== 0)) {
            smallestNonZeroEnding = currentValue; // Update if conditions are met
        }

        // Categorize the current value based on its second digit (as a string character)
        for (let digitVal = 0; digitVal < 10; digitVal++) {
            // Check if the second character of the input string matches the current digit value
            if (parsedLines[entryIndex + 1][1] == String(digitVal)) {
                remainderBins[digitVal].push(currentValue); // Place the number into its designated bin
            }
        }
    }

    // Determine the final output based on the calculated total sum
    if (totalSum % 10 !== 0) {
        console.log(totalSum); // If the total sum is not a multiple of ten, print it directly
    } else {
        // If the total sum is a multiple of ten, apply additional logic
        // Check if all processed numbers ended in zero (i.e., all were placed in the first bin)
        if (remainderBins[0].length === itemCount) {
            console.log(0); // If all numbers ended in zero, output zero
        } else {
            // Otherwise, subtract the smallest non-zero ending number from the total sum
            console.log(totalSum - smallestNonZeroEnding);
        }
    }
}

// Execute the data processing function using content read from standard input
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));