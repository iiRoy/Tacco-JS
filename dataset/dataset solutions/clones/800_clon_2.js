var outputPrinter = console.log;
if(typeof process != "undefined")
{
  var receivedData    = "";
  process.stdin.resume();
  process.stdin.setEncoding(  'utf8'  );
  process.stdin.on ('data' , function ( dataPiece ) {
    receivedData  +=  dataPiece;
  });
  process.stdin.on('end', function ()
  {
    var dataRows = receivedData.split("\n");
    processInputData (dataRows);
  });
}
/*----------------------------------------------------------------------*/
function processInputData(dataRows) {
    // Initial data transformation: parse input lines into numbers
    dataRows = dataRows.map(function (currentRowText) {
        if (currentRowText.split(" ").length >= 2) {
            return currentRowText.split(" ").map(function (valueString) {
                return Number(valueString);
            });
        }
        else {
            return Number(currentRowText);
        }
    });

    // Iterate through all provided data sets until none remain
    while (dataRows.length > 0)
    {
        var currentConfig = dataRows.shift();
        var configParams  = currentConfig;
        var firstCount    = configParams[0];
        var secondCount   = configParams[1];

        // Check for the termination condition for processing
        if (firstCount === 0 && secondCount === 0) {
            return;
        }
        else {
            // Extract the two main data segments based on counts
            var firstDataSet  = dataRows.splice(0, firstCount);
            var secondDataSet = dataRows.splice(0, secondCount);
            analyzeDataSet(firstDataSet, secondDataSet);
        }
    }
}

/* Function dedicated to processing a single pair of input lists */
function analyzeDataSet(firstDataSet, secondDataSet)
{
    /*
     * This function calculates all possible contiguous sub-array sums for both input lists.
     * It then finds the product of frequencies for common sums found in both lists.
     * The complexity of sum generation for each list is O(N^2) where N is list length.
     */
    var firstSumCounts  = generateSumCounts(firstDataSet);
    var secondSumCounts = generateSumCounts(secondDataSet);
    var matchingSumProduct = calculateIntersectionProduct(firstSumCounts, secondSumCounts);
    outputPrinter(matchingSumProduct);
}

// Computes frequencies of all possible contiguous sub-array sums
function generateSumCounts(inputArray) {
    var arrayLength = inputArray.length;
    var sumFrequency = {};
    for (var startIndex = 0; startIndex < arrayLength; startIndex++) {
        var currentSum = 0;
        for (var endIndex = startIndex + 1; endIndex <= arrayLength; endIndex++) {
            currentSum += inputArray[endIndex - 1];
            if (!sumFrequency[currentSum]) {
                sumFrequency[currentSum] = 1;
            } else {
                sumFrequency[currentSum]++;
            }
        }
    }
    return sumFrequency;
}

function calculateIntersectionProduct(mapOne, mapTwo)
{
    var totalProduct = 0;
    for (sumKey in mapOne) {
        if (!!mapTwo[sumKey]) {
            totalProduct += mapOne[sumKey] * mapTwo[sumKey];
        }
    }
    return totalProduct;
}