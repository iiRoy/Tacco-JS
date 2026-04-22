function executeProgram()
{
    while (true)
    {
        // Obtain the number of elements for the current dataset
        var numElements = fetchValue();
        if (numElements === 0)
        {
            // If the count is zero, terminate the processing loop
            break;
        }

        // Get the desired segment length
        var segmentLength = fetchValue();

        // Initialize an array to store the input values
        var valueList = [];

        // Populate the array with 'numElements' values
        iterateRange(numElements, function(loopIndex)
        {
            valueList[loopIndex] = fetchValue();
        });

        // Calculate the initial sum for the first segment
        var currentSum = 0;
        iterateRange(segmentLength, function(loopIndex)
        {
            currentSum += valueList[loopIndex];
        });

        // Store the initial sum as the maximum found so far
        var peakValue = currentSum;

        // Iterate through the remaining segments to find the maximum sum
        iterateRange(numElements - segmentLength, function(loopIndex)
        {
            // Remove the element exiting the window
            currentSum -= valueList[loopIndex];
            // Add the element entering the window
            currentSum += valueList[segmentLength + loopIndex];
            // Update the maximum sum if the current sum is greater
            peakValue = Math.max(currentSum, peakValue);
        });

        // Output the highest segment sum found
        displayOutput(peakValue);
    }
}


function iterateRange(startPoint, endPoint, actionFunc)
{
    // Handle overloaded function signature: iterateRange(count, callback)
    if (actionFunc === null || actionFunc === undefined)
    {
        actionFunc = endPoint;
        endPoint = startPoint;
        startPoint = 0;
    }

    // Loop from startPoint up to (but not including) endPoint
    for (var loopCounter = startPoint; loopCounter < endPoint; ++loopCounter)
    {
        // Execute the callback function; break if it returns false
        if (actionFunc(loopCounter) === false)
        {
            break;
        }
    }
}


process.stdin.resume();
process.stdin.setEncoding('utf8');

var incomingText = '';
var textPointer = 0;


function fetchValue(valueKind)
{
    if (valueKind === 'string')
    {
        return incomingText[textPointer++];
    }
    else
    {
        // Default to number parsing
        return +incomingText[textPointer++];
    }
}


function displayOutput(outputItem)
{
    console.log(outputItem);
}


process.stdin.on('data', function(dataPiece)
{
    incomingText += dataPiece;
});

process.stdin.on('end', function()
{
    // Split the received data into an array of strings by whitespace
    incomingText = incomingText.split(/\s+/);
    // Begin the main program execution
    executeProgram();
});