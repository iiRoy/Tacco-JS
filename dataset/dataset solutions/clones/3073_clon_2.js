function ProcessInputData(rawData) {
    // Split the entire input string into individual lines
    const inputLines = rawData.trim().split('\n');

    // Parse the first line to get configuration parameters
    const configurationValues = inputLines[0].split(/\s+/).map(currentValue => parseInt(currentValue, 10));

    // Extract individual configuration values
    const dimensionA = configurationValues[0];
    const dimensionB = configurationValues[1];
    const dimensionC = configurationValues[2];
    const topNCount = configurationValues[3];

    // Parse the subsequent lines into numeric arrays
    const firstDataSet = inputLines[1].split(/\s+/).map(itemValue => parseInt(itemValue, 10));
    const secondDataSet = inputLines[2].split(/\s+/).map(itemValue => parseInt(itemValue, 10));
    const thirdDataSet = inputLines[3].split(/\s+/).map(itemValue => parseInt(itemValue, 10));

    // Sort all datasets in descending order
    firstDataSet.sort((valueOne, valueTwo) => valueTwo - valueOne);
    secondDataSet.sort((valueOne, valueTwo) => valueTwo - valueOne);
    thirdDataSet.sort((valueOne, valueTwo) => valueTwo - valueOne);


    // Initialize arrays to store intermediate and final sums
    const intermediateSums = [];
    const finalResultCollection = [];

    // Calculate all possible sums from the first two datasets
    for (let indexA = 0; indexA < dimensionA; indexA++) {
        for (let indexB = 0; indexB < dimensionB; indexB++) {
            intermediateSums.push(firstDataSet[indexA] + secondDataSet[indexB]);
        }
    }

    // Sort the intermediate sums in descending order
    intermediateSums.sort((itemA, itemB) => itemB - itemA);


    // Combine intermediate sums with the third dataset
    // The outer loop iterates only up to 'topNCount' or the length of 'intermediateSums', whichever is smaller
    for (let indexC = 0; indexC < Math.min(topNCount, intermediateSums.length); indexC++) {
        for (let indexD = 0; indexD < dimensionC; indexD++) {
            // This condition is an early exit to potentially prune combinations,
            // though its effectiveness depends on the input values.
            if (Math.min(topNCount, intermediateSums.length) < indexC * indexD) {
                continue;
            }
            finalResultCollection.push(intermediateSums[indexC] + thirdDataSet[indexD]);
        }
    }

    // Sort the final collection of sums in descending order
    finalResultCollection.sort((elementOne, elementTwo) => elementTwo - elementOne);

    // Print the top 'topNCount' sums from the final collection
    for (let outputIndex = 0; outputIndex < topNCount; outputIndex++) {
        console.log(finalResultCollection[outputIndex]);
    }
}

// Read input from standard input and pass it to the processing function
ProcessInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));