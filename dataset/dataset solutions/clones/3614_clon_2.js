var inputRowsCollection = [];
var dimensionA, dimensionB, dimensionC;
var prefixSumArray;

var inputSystem = require('readline');

var ioInterface = inputSystem.createInterface(
    {
        input: process.stdin,
        output: process.stdout
    }
);

ioInterface.on
(
    'line',
    function (currentInputLine)
    {
        inputRowsCollection.push(currentInputLine);
    }
);

ioInterface.on('close',
    function ()
    {
        // Parse initial parameters from the first input line
        dimensionA = Number(inputRowsCollection[0].split(" ")[0]);
        dimensionB = Number(inputRowsCollection[0].split(" ")[1]);
        dimensionC = Number(inputRowsCollection[0].split(" ")[2]);

        // Initialize a 2D array for prefix sums
        prefixSumArray = Array(dimensionA + 1).fill(0).map(
            (val) => Array(dimensionA + 1).fill(0)
        );

        // Declare arrays for operation bounds
        var leftLimits = Array(dimensionB);
        var rightLimits = Array(dimensionB);

        // Populate operation bounds from input
        for (var operationIdx = 0; operationIdx < dimensionB; operationIdx++)
        {
            var partsOfLine = inputRowsCollection[operationIdx + 1].split(" ");
            leftLimits[operationIdx] = Number(partsOfLine[0]);
            rightLimits[operationIdx] = Number(partsOfLine[1]);
        }

        // Declare arrays for query ranges
        var queryStartPoints = Array(dimensionC);
        var queryEndPoints = Array(dimensionC);

        // Populate query ranges from input
        for (var queryIdx = 0; queryIdx < dimensionC; queryIdx++)
        {
            var lineSegments = inputRowsCollection[queryIdx + dimensionB + 1].split(" ");
            queryStartPoints[queryIdx] = Number(lineSegments[0]);
            queryEndPoints[queryIdx] = Number(lineSegments[1]);
        }

        // Construct the cumulative sum table
        computePrefixSums(leftLimits, rightLimits);

        // Process each query and output the result
        for (var currentQueryIndex = 0; currentQueryIndex < dimensionC; currentQueryIndex++)
        {
            var finalResult = prefixSumArray[queryEndPoints[currentQueryIndex]][queryEndPoints[currentQueryIndex]]
                            - prefixSumArray[queryEndPoints[currentQueryIndex]][queryStartPoints[currentQueryIndex] - 1]
                            - prefixSumArray[queryStartPoints[currentQueryIndex] - 1][queryEndPoints[currentQueryIndex]]
                            + prefixSumArray[queryStartPoints[currentQueryIndex] - 1][queryStartPoints[currentQueryIndex] - 1];
            console.log(finalResult);
        }
    }
);

function computePrefixSums(leftBoundaries, rightBoundaries)
{
    // Apply initial increments based on operations
    for (var operationCounter = 0; operationCounter < dimensionB; operationCounter++)
    {
        prefixSumArray[leftBoundaries[operationCounter]][rightBoundaries[operationCounter]]++;
    }

    // Calculate 2D prefix sums
    for (var rowIndex = 1; rowIndex <= dimensionA; rowIndex++)
    {
        for (var colIndex = 1; colIndex <= dimensionA; colIndex++)
        {
            prefixSumArray[rowIndex][colIndex] += prefixSumArray[rowIndex - 1][colIndex];
            prefixSumArray[rowIndex][colIndex] += prefixSumArray[rowIndex][colIndex - 1];
            prefixSumArray[rowIndex][colIndex] -= prefixSumArray[rowIndex - 1][colIndex - 1];
        }
    }
}