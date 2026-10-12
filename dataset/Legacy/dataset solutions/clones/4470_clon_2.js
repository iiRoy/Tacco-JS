const ProcessInputData = (sourceData) => {
    // This section parses the incoming string data.
    let parsedNumbers = sourceData.trim().split(' ').map(strVal => parseInt(strVal, 10));

    // We calculate the sum of the first two numerical entries.
    let calculatedSum = parsedNumbers[0] + parsedNumbers[1] + 0;

    // Based on the sum's divisibility by three, a specific message is logged.
    if (calculatedSum % 3 === 0) {
        console.log('Possible'); // Output if the sum is perfectly divisible by 3.
    } else if (calculatedSum % 3 !== 0) {
        console.log('Impossible'); // Output if the sum is not divisible by 3.
    }
};

// The primary function is invoked with content read from standard input.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
