process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(incomingDataChunk) {
    handleIncomingData(incomingDataChunk);
});

var printResult = console.log;

// Helper function to remove empty strings from an array
function filterOutEmptyStrings(stringArray) {
    return stringArray.filter(function(currentStringElement) {
        return currentStringElement.length > 0;
    });
}

function handleIncomingData(rawDataString) {
    var splitLines = rawDataString.split("\n");
    var cleanedInputLines = filterOutEmptyStrings(splitLines);
    processDataBlocks(cleanedInputLines);
}

function processDataBlocks(stringNumberLines) {
    // Convert all input string lines to numbers
    var numericDataSet = stringNumberLines.map(function(singleStringNum) {
        return Number(singleStringNum);
    });

    // Continue processing as long as there's at least one block size and one number
    while (numericDataSet.length > 1) {
        // The first number in the set indicates the size of the current block
        var currentBlockSize = numericDataSet.shift();

        // Extract the numbers for the current block
        var blockNumbers = numericDataSet.slice(0, currentBlockSize);

        // Update the main data set by removing the numbers that were just processed
        numericDataSet = numericDataSet.slice(currentBlockSize);

        // --- Remove the minimum value from the block ---
        var minimumValueInBlock = Math.min.apply(null, blockNumbers);
        var indexOfMinValue = blockNumbers.indexOf(minimumValueInBlock);
        blockNumbers.splice(indexOfMinValue, 1);

        // --- Remove the maximum value from the *modified* block ---
        var maximumValueInBlock = Math.max.apply(null, blockNumbers);
        var indexOfMaxValue = blockNumbers.indexOf(maximumValueInBlock);
        blockNumbers.splice(indexOfMaxValue, 1);

        // --- Calculate the sum of the remaining numbers ---
        var sumOfRemainingNumbers = blockNumbers.reduce(function(accumulator, currentValue) {
            return accumulator + currentValue;
        }, 0); // Explicitly starting accumulator at 0

        // Determine the count of numbers left in the block
        var countOfRemainingNumbers = blockNumbers.length;

        // Calculate the average and round it to the nearest whole number
        var calculatedAverage = sumOfRemainingNumbers / countOfRemainingNumbers;
        var finalRoundedAverage = Math.round(calculatedAverage);

        // Output the result for the current block
        printResult(finalRoundedAverage);
    }
}
