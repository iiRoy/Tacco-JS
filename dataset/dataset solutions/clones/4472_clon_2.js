const ProcessInput = (rawData) => {
    // This part handles the initial data preparation from the raw input string.
    let parsedNumbers = rawData.trim()
                               .split(' ')
                               .map( (elementStr) => {
                                   // Converting each string segment into an integer.
                                   return parseInt(elementStr, 10);
                               });

    // We calculate the combined value of the initial two numerical entries.
    let totalSum = parsedNumbers[0] + parsedNumbers[1];

    // Now, we evaluate if the calculated sum is perfectly divisible by three.
    if (totalSum % 3 === 0) {
        console.log('Possible'); // Output for when the condition is met.
    }
    else if (totalSum % 3 !== 0) { // Explicit check for the opposite condition.
        console.log('Impossible'); // Output for when the condition is not met.
    }
};

// Initiating the main processing sequence by reading from standard input.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));