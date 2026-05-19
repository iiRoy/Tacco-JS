function processInput(rawData) {
    // Split the raw input string into an array of individual lines.
    const parsedLines = rawData.split('\n');

    // Iterate through the parsed lines, processing data in pairs.
    // The loop increments by two to handle a data line and its corresponding values line.
    for (let lineIndex = 0; lineIndex < parsedLines.length; lineIndex += 2) {
        // Check for the termination condition: if the current line is '0', stop processing.
        if (parsedLines[lineIndex] === '0') {
            break; // Exit the loop.
        }

        // Initialize a string to store the calculated result for the current data set.
        let resultString = '';
        // Initialize a variable to accumulate the sum of squared differences from the mean.
        let sumOfSquares = 0.0; // Using float for precision.

        // The number of elements for the current calculation is derived from the current line.
        // Subtracting 0 converts the string to a number.
        const elementCount = parsedLines[lineIndex] - 0;

        // Inner loop to process each element in the data set.
        for (let elementIndex = 0; elementIndex < elementCount; elementIndex++) {
            // Split the next line (which contains the numbers) by space into an array of strings.
            const numberStrings = parsedLines[lineIndex + 1].split(' ');

            // Calculate the arithmetic mean (average) of the numbers.
            // The reduce function sums up the numbers, converting them from strings to numbers using (a-0) and (b-0).
            const meanValue = numberStrings.reduce(function(accumulator, currentValue) {
                return (accumulator - 0) + (currentValue - 0);
            }) / elementCount;

            // Accumulate the sum of squared differences from the mean.
            // This is a step in calculating the standard deviation.
            sumOfSquares += Math.pow( (numberStrings[elementIndex] - meanValue), 2 ) / elementCount;
        }

        // Calculate the standard deviation by taking the square root of the accumulated sum.
        // Then, format the result to four decimal places and append it to the result string.
        resultString += (Math.sqrt(sumOfSquares)).toFixed(4);
        // Output the calculated standard deviation to the console.
        console.log(resultString);
    }
}

// Read the entire content of standard input as a UTF-8 string.
// Then, pass this raw data to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
