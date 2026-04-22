// Function responsible for orchestrating the overall data processing
function processInputData(rawDataContent) {

    // Divide the entire input string into an array of separate text lines
    const parsedLineEntries = rawDataContent.split('\n');

    // Traverse through the collection of parsed lines, incrementing the index by two
    // to process pairs of lines (count and data).
    for (
        let outerCycleIndex = 0;
        outerCycleIndex < parsedLineEntries.length;
        outerCycleIndex += 2
    ) {
        // Check if the current line signals termination of data processing.
        if (parsedLineEntries[outerCycleIndex] === '0') {
            // If the termination signal is found, exit the loop immediately.
            break;
        }

        // Initialize a string variable to store the computed result for the current block.
        let iterationOutcome = '';
        // Initialize a floating-point accumulator for the variance calculation steps.
        let sumOfSquaredDifferences = 0.0;

        // Extract the number of measurements for the current dataset from the line.
        // Explicitly convert the string representation to a floating-point number.
        const numberOfMeasurements = parseFloat(parsedLineEntries[outerCycleIndex]);

        // Begin an internal loop to iterate through each individual measurement value.
        for (
            let innerMeasurementIndex = 0;
            innerMeasurementIndex < numberOfMeasurements;
            innerMeasurementIndex++
        ) {
            // Retrieve the line containing the actual measurement values and split it by spaces.
            const measurementValues = parsedLineEntries[outerCycleIndex + 1].split(' ');

            // Calculate the arithmetic mean (average) of the current set of measurement values.
            // The 'reduce' method sums all numeric values, and the total is then divided by the count.
            const arithmeticMean = measurementValues.reduce(function (accumulatorA, currentValB) {
                return (parseFloat(accumulatorA)) + (parseFloat(currentValB));
            }) / numberOfMeasurements;

            // Accumulate the squared difference of each measurement from the mean,
            // divided by the total count, contributing to the variance.
            sumOfSquaredDifferences += Math.pow(
                parseFloat(measurementValues[innerMeasurementIndex]) - arithmeticMean, 2
            ) / numberOfMeasurements;
        }

        // Compute the standard deviation by taking the square root of the accumulated sum.
        // Format the resulting value to exactly four decimal places.
        iterationOutcome += (Math.sqrt(sumOfSquaredDifferences)).toFixed(4);
        // Output the calculated standard deviation to the console for user visibility.
        console.log(iterationOutcome);
    }
}

// A utility function to retrieve file contents, mirroring the original's file read operation.
function obtainFileContent(filePathIdentifier) {
    // Utilize Node.js's file system module to synchronously read the file.
    return require('fs').readFileSync(filePathIdentifier, 'utf8');
}

// Initiate the primary data processing routine, feeding it content from standard input.
processInputData(obtainFileContent('/dev/stdin'));