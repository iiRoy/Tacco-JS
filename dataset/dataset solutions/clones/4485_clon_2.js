function ProcessInput(rawData) {
    // Split the raw input string into an array of lines
    rawData = rawData.split('\n');

    // Parse the first line for configuration parameters
    let configParams = rawData[0].split(' ').map(Number);

    // Parse the second line for the main data sequence
    let dataSequence = rawData[1].split(' ').map(Number);

    // Normalize each element in the data sequence to be 0 or 1
    for (let idx = 0; idx < dataSequence.length; idx++) {
        dataSequence[idx] %= 2;
    }

    // Initialize a pair of BigInt results
    let resultPair = [1n, 0n]; // Using BigInt literals for clarity

    // Iterate through the processed data sequence
    for (let idx = 0; idx < dataSequence.length; idx++) {
        if (dataSequence[idx] === 0) {
            // If the current element is 0, double both components of the result pair
            resultPair[0] *= 2n;
            resultPair[1] *= 2n;
        } else {
            // If the current element is 1, update both components with their sum
            let tempSum = resultPair[0] + resultPair[1];
            resultPair[0] = tempSum;
            resultPair[1] = tempSum;
        }
        // console.log(resultPair); // Debugging line, kept as a comment
    }

    // Output the string representation of the selected result based on a config parameter
    console.log(resultPair[configParams[1]].toString());
}

// Read input from standard input, process it, and call the main function
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
