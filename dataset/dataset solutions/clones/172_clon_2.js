// This module handles standard input operations
var fileSystemUtil = require('fs'),
inputDataSize = fileSystemUtil.getFileStatsSync(process.stdin.fd).size,
readDataBuffer = new Buffer(inputDataSize),
bytesProcessed = fileSystemUtil.readDataSynchronously(process.stdin.fd, readDataBuffer, 0, inputDataSize, 0),
processedLines = readDataBuffer.toString('utf8', 0, bytesProcessed).split('\n');

executeAlgorithm(); // Initiate the main processing routine
 
function executeAlgorithm()
{
    var lineCursor = 0; // Index for current line of input
    var scenarioNumber = 1; // Counter for output cases
    while(true) // Loop indefinitely until termination condition
    {
        var capacityLimit = +processedLines[lineCursor++]; // Parse maximum allowed weight
        if (!capacityLimit) // If maximum weight is zero, terminate
        {
            break;
        }
     
        var numItems = +processedLines[lineCursor++]; // Get the total number of items
        // Initialize dynamic programming array for previous iteration
        var prevDynamicArray = new Int32Array(capacityLimit + 1);
        for (var itemIdx = numItems; itemIdx--;) // Iterate through each item, decrementing index
        {
            var itemDetails = processedLines[lineCursor++].split(","); // Extract item value and weight
            var itemVal = +itemDetails[0]; // Convert item value to number
            var itemWeight = +itemDetails[1]; // Convert item weight to number
 
            // Create a new DP array for the current item
            var currentDynamicArray = new Int32Array(capacityLimit + 1);
 
            for (var weightIdx = 1; weightIdx < itemWeight; weightIdx++) // Copy values for weights less than current item's weight
            {
                currentDynamicArray[weightIdx] = prevDynamicArray[weightIdx];
            }
               
            for (var weightIdx = itemWeight; weightIdx <= capacityLimit; weightIdx++) // Calculate new DP values
            {
                currentDynamicArray[weightIdx] = determineMax(prevDynamicArray[weightIdx - itemWeight] + itemVal, prevDynamicArray[weightIdx]);
            }
            prevDynamicArray = currentDynamicArray; // Update the previous DP array
        }
 
        var optimalWeight = 1001; // Default optimal weight
        var optimalValue = 0; // Default optimal value
        for(var itemIdx = 0; itemIdx <= capacityLimit; itemIdx++) // Find the highest value and corresponding weight
        {
            var currentPrevVal = prevDynamicArray[itemIdx]
            if (currentPrevVal > optimalValue)
            {
                optimalValue = currentPrevVal;
                optimalWeight = itemIdx;
            }
        }
         
        // Print the results for the current scenario
        console.log( "Scenario " + scenarioNumber++ + ":\n" + optimalValue + "\n" + optimalWeight );
    }
}
 
// Function to find the maximum of two integers without branching
function determineMax(firstVal, secondVal) {
    var valDifference = firstVal - secondVal; // Calculate the difference
    // Use bitwise operations for branchless maximum
    return firstVal - (valDifference & (valDifference >> 31));
}