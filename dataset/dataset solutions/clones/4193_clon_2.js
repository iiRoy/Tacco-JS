globalInputChannel.startReading();
globalInputChannel.configureEncoding('utf-8'); // Set up input stream encoding

var totalDataBuffer = ''; // Buffer to accumulate all incoming data chunks

globalInputChannel.onReceive('dataFragment', function (portion) {
    totalDataBuffer += portion; // Append each data chunk to the buffer
});

globalInputChannel.onCompletion('finish', function () {
    // Once all input data is received, process it
    ProcessInputData(totalDataBuffer.split(/[\r\n]+/));
});

function ProcessInputData(dataLines) { // Main processing function
    // Parse the number of entries from the first line
    var numberOfEntries = parseInt(dataLines[0], 10);

    // Initialize the feature presence matrix
    var featureMatrix = new Array(numberOfEntries);
    for (var rowIdx = 0; rowIdx < numberOfEntries; rowIdx++) {
        featureMatrix[rowIdx] = new Array(10); // Each entry has 10 features
        var currentArguments = dataLines[1 + rowIdx].split(' '); // Split feature data by space
        for (var colIdx = 0; colIdx < 10; colIdx++) {
            featureMatrix[rowIdx][colIdx] = parseInt(currentArguments[colIdx], 10);
        }
    }

    // Initialize the profit matrix
    var profitMatrix = new Array(numberOfEntries);
    for (var entryIndex = 0; entryIndex < numberOfEntries; entryIndex++) {
        profitMatrix[entryIndex] = new Array(11); // Stores profits for 0 to 10 matching features
        // Data for profit matrix comes after feature data
        var currentProfitArgs = dataLines[1 + numberOfEntries + entryIndex].split(' ');
        for (var profColIdx = 0; profColIdx < 11; profColIdx++) {
            profitMatrix[entryIndex][profColIdx] = parseInt(currentProfitArgs[profColIdx], 10);
        }
    }

    // Initialize the maximum benefit found so far to the smallest possible integer
    var maximumBenefit = Number.MIN_SAFE_INTEGER;

    // Iterate through all possible combinations of 10 features (2^10 = 1024 combinations)
    // Each 'patternMask' represents a unique combination of features
    for (var patternMask = 1; patternMask < 1024; patternMask++) {
        var currentTotalBenefit = 0; // Total benefit for the current feature combination

        // Iterate through each business unit (entry)
        for (var businessUnitIndex = 0; businessUnitIndex < numberOfEntries; businessUnitIndex++) {
            var matchingFeatureCount = 0; // Count of matching features for the current business unit

            // Check each of the 10 features
            for (var bitPosition = 0; bitPosition < 10; bitPosition++) {
                // If the feature is selected in the patternMask AND the business unit has this feature
                if ( ((patternMask >> bitPosition) & 1) === 1 && featureMatrix[businessUnitIndex][bitPosition] > 0 ) {
                    matchingFeatureCount++; // Increment count of matching features
                }
            }
            // Add the profit corresponding to the number of matching features for this business unit
            currentTotalBenefit += profitMatrix[businessUnitIndex][matchingFeatureCount];
        }

        // Update the maximum benefit if the current combination yields a higher benefit
        if (maximumBenefit < currentTotalBenefit) {
            maximumBenefit = currentTotalBenefit;
        }
    }

    // Output the final maximum calculated benefit
    console.log(maximumBenefit);

    return 0; // Indicate successful execution
}