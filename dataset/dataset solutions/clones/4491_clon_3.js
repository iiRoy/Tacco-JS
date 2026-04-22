// Main function responsible for orchestrating the data processing workflow
function processInputData(rawTextContent) {
    // Define a constant for the number of initial elements whose sum is required
    const COUNT_FOR_INITIAL_SUM = 3;

    // Helper utility to compute the sum of the first 'limit' elements within an array
    const calculatePrefixSum = (dataCollection, limit) => {
        let accumulatedTotal = 0;
        // Iterate only up to the specified limit or the array's length, whichever is smaller
        const actualLimit = Math.min(limit, dataCollection.length);
        for (let idx = 0; idx < actualLimit; idx++) {
            accumulatedTotal += dataCollection[idx];
        }
        return accumulatedTotal;
    };

    // Step 1: Pre-process the raw input string
    // Ensure all leading and trailing whitespace is removed for clean parsing
    const cleanedStringInput = rawTextContent.trim();
    // Divide the cleaned string into an array of string tokens using space as a delimiter
    const stringTokensArray = cleanedStringInput.split(" ");

    // Guard condition: Check if the input contains enough elements
    // This prevents errors if the input is too short for the subsequent operations
    if (stringTokensArray.length < COUNT_FOR_INITIAL_SUM) {
        console.error("Error: Input does not contain sufficient elements. Expected at least " + COUNT_FOR_INITIAL_SUM + " numbers.");
        return 0; // Return a default value indicating an error or insufficient data
    }

    // Step 2: Transform string tokens into numerical values
    // Convert each string token to an integer, explicitly specifying base 10
    // Subsequently, filter out any values that could not be successfully parsed into numbers (NaN)
    const numericalDataSet = stringTokensArray
        .map(segment => parseInt(segment, 10))
        .filter(value => !isNaN(value)); // Ensure only valid numbers proceed

    // Another guard condition: Verify that after parsing and filtering, we still have enough valid numbers
    if (numericalDataSet.length < COUNT_FOR_INITIAL_SUM) {
        console.error("Error: After parsing, not enough valid numerical data found. Expected at least " + COUNT_FOR_INITIAL_SUM + " numbers.");
        return 0;
    }

    // Step 3: Compute the sum of the first N elements from the numerical data set
    const sumOfDesignatedPrefix = calculatePrefixSum(numericalDataSet, COUNT_FOR_INITIAL_SUM);

    // Step 4: Determine the highest numerical value present across the entire parsed data set
    // The spread operator (...) is used here for concisely passing array elements as individual arguments to Math.max
    const maximumValueInSet = Math.max(...numericalDataSet);

    // Step 5: Execute the core arithmetic operation based on the problem's requirements
    const finalCalculatedResult = sumOfDesignatedPrefix - maximumValueInSet;

    // Step 6: Output the computed result to the standard console
    console.log(finalCalculatedResult);
}

// Entry point for script execution: Handles reading input from the system's standard input stream
try {
    // Utilize Node.js 'fs' module to synchronously read the content of /dev/stdin
    // The 'utf8' encoding ensures proper character handling
    const systemInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Invoke the primary processing function with the content obtained from standard input
    processInputData(systemInputContent);
} catch (inputReadError) {
    // Catch and report any potential errors that might occur during the input reading process
    // Such errors could include file not found, permission issues, or other I/O problems
    console.error("An error occurred while attempting to read from standard input:", inputReadError.message);
    // Optionally, a non-zero exit code can be used to signal an application failure
    // process.exit(1);
}