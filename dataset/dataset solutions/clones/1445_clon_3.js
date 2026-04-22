// This utility script is designed to process multiple datasets provided via standard input.
// For each dataset, it calculates and outputs the population standard deviation.
// The input format expects a line indicating the number of elements (N),
// followed by a line containing N space-separated numeric values.
// Processing continues until a dataset size of 0 is encountered.

// Acquire the necessary Node.js module for file system operations.
const nodeFileSystem = require('fs');

// Define the source for input data. In a typical competitive programming environment,
// this points to standard input.
const standardInputSource = '/dev/stdin';
// Specify the character encoding to correctly interpret the input bytes as text.
const characterEncoding = 'utf8';

// Read all content from the standard input synchronously.
// This approach is common in scripting for competitive programming to simplify input handling.
let rawStreamContent = nodeFileSystem.readFileSync(standardInputSource, characterEncoding);

// Pre-process the raw input:
// 1. Remove any leading or trailing whitespace (like final newlines).
// 2. Split the entire content into an array of strings, where each string represents a single line.
// This effectively creates a queue of input lines to be consumed sequentially.
let processedInputLines = rawStreamContent.trim().split('\n');

// Initialize a counter to keep track of the number of datasets processed or attempted.
let currentDatasetIndex = 0;

// Commence the primary processing loop. This loop continues indefinitely
// until an explicit break condition is met, allowing for an arbitrary number of datasets.
for (;;) { // An alternative to while(true)
    // Increment the dataset index for the current iteration.
    currentDatasetIndex++;

    // Extract the next line from our buffer. This line is expected to specify the size of the upcoming dataset.
    const datasetSizeLine = processedInputLines.shift();

    // Check if the input buffer has been exhausted. If so, there's no more data to process.
    if (datasetSizeLine === undefined) {
        // console.warn("Input stream exhausted. Terminating processing loop."); // Optional: for debugging
        break; // Exit the loop as there are no more input lines.
    }

    // Attempt to convert the 'datasetSizeLine' string into an integer.
    // .trim() removes any surrounding whitespace, and radix 10 ensures decimal parsing.
    const numberOfElements = Number.parseInt(datasetSizeLine.trim(), 10);

    // Check for the designated termination signal: a dataset size of 0.
    if (numberOfElements === 0) {
        // console.log(`Termination signal (N=0) received after processing ${currentDatasetIndex - 1} valid datasets.`); // Optional: for debugging
        break; // Exit the loop as per problem specification.
    }

    // Validate the parsed number of elements. It must be a positive integer.
    // If it's not a number or is less than 1, we consider it an invalid input line.
    if (isNaN(numberOfElements) || numberOfElements < 1) {
        console.error(`Error: Invalid dataset size '${datasetSizeLine}' detected at iteration ${currentDatasetIndex}. Skipping this dataset.`);
        // To maintain correct alignment for subsequent inputs, we must also consume the next line,
        // which would have been the data line for this invalid size.
        if (processedInputLines.length > 0) {
            processedInputLines.shift(); // Discard the corresponding data line.
        }
        continue; // Skip to the next iteration of the loop to process the next potential dataset.
    }

    // Retrieve the line containing the actual data points for the current dataset.
    const dataPointsString = processedInputLines.shift();

    // Critical check: Ensure that a data line exists after a valid dataset size was read.
    // If it's missing, the input format is corrupted or truncated.
    if (dataPointsString === undefined) {
        console.error(`CRITICAL ERROR: Expected data values for dataset of size ${numberOfElements} (iteration ${currentDatasetIndex}), but no data line found. Aborting.`);
        break; // Abort processing entirely due to severe input format error.
    }

    // Parse the data points string into an array of floating-point numbers.
    // Each string segment is split by spaces and then converted using Number.parseFloat
    // to handle potential decimal values accurately.
    const numericalValuesArray = dataPointsString.split(' ').map(valueToken => Number.parseFloat(valueToken));

    // Another validation step: Verify that the number of parsed values matches the declared size.
    if (numericalValuesArray.length !== numberOfElements) {
        console.error(`Warning: Declared dataset size (${numberOfElements}) does not match the actual number of values (${numericalValuesArray.length}) provided in iteration ${currentDatasetIndex}. Skipping this dataset.`);
        continue; // Skip this dataset due to mismatch.
    }

    // --- Begin Statistical Computation Pipeline ---

    // 1. Calculate the sum of all numerical elements in the current dataset.
    // A traditional loop is used here for direct control and explicit accumulation.
    let aggregateSum = 0.0; // Initialize as a float for precise arithmetic.
    for (const singleValue of numericalValuesArray) {
        // Basic sanity check for each individual data point.
        if (isNaN(singleValue)) {
            console.error(`Warning: Non-numeric value '${singleValue}' encountered within dataset at iteration ${currentDatasetIndex}. Skipping this entire dataset.`);
            aggregateSum = NaN; // Mark the sum as invalid.
            break; // Exit the loop for this dataset's sum calculation.
        }
        aggregateSum += singleValue;
    }

    // If any data point was invalid, the sum will be NaN, so skip to the next dataset.
    if (isNaN(aggregateSum)) {
        continue;
    }

    // 2. Compute the arithmetic mean (average) of the dataset.
    // This is the sum of values divided by the count of values.
    const datasetMean = aggregateSum / numberOfElements;

    // 3. Calculate the sum of squared differences from the mean.
    // This is a crucial intermediate step for computing variance and standard deviation.
    // Utilizing the 'reduce' method to demonstrate a functional programming approach.
    const sumOfSquaredDeviations = numericalValuesArray.reduce((accumulator, elementValue) => {
        // Determine how much the current element deviates from the calculated mean.
        const deviationComponent = elementValue - datasetMean;
        // Add the square of this deviation to the running total.
        // Direct multiplication is used as an alternative to Math.pow for squaring.
        return accumulator + (deviationComponent * deviationComponent);
    }, 0.0); // Start the accumulator at 0.0 for float precision.

    // 4. Compute the final population standard deviation.
    // This involves taking the square root of the mean of the squared deviations.
    let computedStandardDeviation = 0.0;
    // An additional safeguard against division by zero, though 'numberOfElements' is already checked to be > 0.
    if (numberOfElements > 0) {
        computedStandardDeviation = Math.sqrt(sumOfSquaredDeviations / numberOfElements);
    } else {
        // This branch should ideally not be reached due to prior validation.
        console.warn(`Attempted to calculate standard deviation for zero elements at iteration ${currentDatasetIndex}. Result will be 0.`);
    }


    // --- Output Result ---

    // Print the calculated standard deviation to standard output.
    // The result is formatted to eight decimal places as per common problem requirements.
    // A template literal is employed for string interpolation.
    console.log(`${computedStandardDeviation.toFixed(8)}`);
}

// The script concludes once the processing loop has exited.