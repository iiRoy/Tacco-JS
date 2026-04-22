function processInputData(rawDataString) {
    // This function processes the incoming raw string data from an input source.
    const inputLinesArray = rawDataString.split('\n');

    // The first line typically contains configuration parameters.
    const firstLineTokens = inputLinesArray[0].split(' ');
    
    // Parse the total number of elements from the first parameter.
    const totalCount = parseInt(firstLineTokens[0], 10);
    /*
     * Parse the number of elements to be summed from the second parameter.
     * This value dictates the loop's iteration count.
     */
    const itemsToSelect = parseInt(firstLineTokens[1], 10);

    // The second line contains the actual numeric data.
    const numericDataSet = inputLinesArray[1]
                                 .split(' ') // Split by space to get string numbers
                                 .map(currentStringNum => parseInt(currentStringNum, 10)) // Convert each string to an integer
                                 .sort((elementA, elementB) => {
                                     // Sort in descending order to easily pick the largest values
                                     return elementB - elementA;
                                 });

    let finalSumResult = 0; // Initialize the accumulator for the sum.
    
    // Iterate through the sorted array, summing the top 'itemsToSelect' elements.
    for ( let loopIndex = 0;
          loopIndex < itemsToSelect;
          loopIndex++ )
    {
        finalSumResult += numericDataSet[loopIndex]; // Add the current element to the running total.
    }
    
    // Output the computed sum to the standard console.
    console.log(finalSumResult);
}

// Entry point: Read data from standard input and pass it to the processing function.
const fileSystemOps = require('fs');
const standardInputSource = '/dev/stdin';
const textEncoding = 'utf8';
processInputData(fileSystemOps.readTextFromFile(standardInputSource, textEncoding));