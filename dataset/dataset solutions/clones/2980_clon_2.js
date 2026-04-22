function processData(rawData) {
    // Split the input string by spaces to get individual tokens
    const tokens = rawData.split(' ');

    // Parse integer values for the three components and the target sum
    const redComponent = parseInt(tokens[0], 10);
    const greenComponent = parseInt(tokens[1], 10);
    const blueComponent = parseInt(tokens[2], 10);
    const targetValue = parseInt(tokens[3], 10);

    // Create an array of components and sort them to potentially optimize calculations
    const sortedComponentsArray = [redComponent, greenComponent, blueComponent].sort();

    // Calculate maximum possible repetitions for each component based on the target value
    // This provides an upper bound for the loops
    const maxRepsForRed = Math.floor(targetValue / sortedComponentsArray[0]);
    const maxRepsForGreen = Math.floor(targetValue / sortedComponentsArray[1]);
    const maxRepsForBlue = Math.floor(targetValue / sortedComponentsArray[2]);

    // Initialize a counter for valid combinations
    let validCombinationCounter = 0;

    // Outer loop for the first component (red)
    for (let currentRedCount = 0; currentRedCount <= maxRepsForRed; currentRedCount++) {

        // Check if the current red component value alone matches the target
        if (currentRedCount * redComponent === targetValue) {
            validCombinationCounter++; // Increment if a match is found
            continue; // Skip inner loops if a single component already satisfies the condition
        }

        // Inner loop for the second component (green)
        // The upper limit is adjusted based on the remaining value after the first component
        for (let currentGreenCount = 0; currentGreenCount <= targetValue - redComponent * currentRedCount; currentGreenCount++) {

            // Check if the sum of red and green components matches the target
            if (redComponent * currentRedCount + greenComponent * currentGreenCount === targetValue) {
                validCombinationCounter++; // Increment if a match
                continue; // Skip the innermost loop
            }

            // Innermost loop for the third component (blue)
            // The upper limit is adjusted based on the remaining value after red and green
            for (let currentBlueCount = 0; currentBlueCount <= targetValue - redComponent * currentRedCount - greenComponent * currentGreenCount; currentBlueCount++) {

                // Check if the sum of all three components matches the target value
                if (redComponent * currentRedCount + greenComponent * currentGreenCount + blueComponent * currentBlueCount === targetValue) {
                    validCombinationCounter++; // Increment the counter for a successful combination
                }
            }
        }
    }

    // Output the final count of combinations to the console
    console.log(validCombinationCounter);
}

// Read input from standard input and pass it to the processing function
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));