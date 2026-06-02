'use strict'; // Enforce strict mode for cleaner code

/**
 * Processes input data to calculate modified times based on queries.
 * @param {string} rawData - The raw input string containing N, T, M, and PX data.
 */
function ProcessInput(rawData) {
    // Split the input string into an array of lines and clean up leading/trailing whitespace.
    const linesArray = rawData.trim().split('\n');

    // Extract the number of elements for the time array.
    const numElements = Number(linesArray[0]);

    // Parse the time values from the second line.
    // Each value is converted to a number.
    const timeValues = linesArray[1].split(' ').map(valStr => Number(valStr));

    // Get the number of queries from the third line.
    const numQueries = Number(linesArray[2]);

    // Extract the query data, starting from the fourth line.
    // The splice method modifies linesArray in place, removing the first 3 elements.
    const queryData = linesArray.splice(3);

    // Calculate the initial sum of all time values.
    // This sum will be adjusted for each query.
    let initialSum = 0;
    for (const currentVal of timeValues) {
        initialSum += currentVal;
    }

    // Process each query.
    // Each query modifies one time value and asks for the new total sum.
    for (const queryLine of queryData) {
        // Parse the query line into its components: index and new value.
        const queryParts = queryLine.split(' ').map(partStr => Number(partStr));

        // Calculate the difference caused by the query.
        // The original time at the specified index minus the new time.
        const timeDifference = timeValues[queryParts[0] - 1] - queryParts[1];

        // Calculate the final time by subtracting the difference from the initial sum.
        const finalTime = initialSum - timeDifference;

        // Output the calculated final time for the current query.
        console.log(finalTime);
    }
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
