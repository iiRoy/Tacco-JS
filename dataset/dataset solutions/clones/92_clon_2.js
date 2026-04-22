/*
 * This module processes a series of numerical inputs
 * to find the maximum contiguous sub-array sum for each
 * provided sequence.
 */

function calcProc( )
{ // Entry point for the primary calculation routine
  var
    idxX, // Main index for traversing input lines
    idxY, // Secondary index for array population and sub-array start
    idxZ, // Tertiary index for calculating sums within sub-arrays
    elemNum, // Stores the count of elements for the current sequence
    valArray, // Array to hold the numerical values of the current sequence
    maxVal, // Holds the maximum sum found for the current sequence
    curTotal; // Accumulator for the current sub-array sum

  // Loop through the entryData, parsing sequence sizes
  for(idxX = 0; elemNum = parseInt(entryData[idxX++], 10); )
  {
    // Initialize the array for the current numerical sequence
    valArray = [];

    // Populate the valArray with numbers from entryData
    for(idxY = 0; idxY < elemNum; idxY++)
    {
      valArray[idxY] = parseInt(entryData[idxX + idxY], 10);
    }
    // Adjust the main index to skip the processed sequence elements
    idxX += elemNum;

    // Initialize maxVal to a very low number to ensure any sum is greater
    maxVal = Number.NEGATIVE_INFINITY; /* This will correctly capture
                                            even negative maximum sums */

    // Iterate through all possible starting points for sub-arrays
    for(idxY = 0; idxY < elemNum; idxY++)
    {
      // Reset the current total for each new starting point
      curTotal = 0;
      // Iterate from the current starting point to the end of the sequence
      for(idxZ = idxY; idxZ < elemNum; idxZ++)
      {
        // Add the current element to the running total
        curTotal += valArray[idxZ];
        // Check if the current total is greater than the overall maximum found
        if(curTotal > maxVal)
        {
          maxVal = curTotal; // Update the maximum value
        }
      }
    }
    // Output the maximum sum for the current sequence to the console
    console.log(maxVal);
  }
}

// Declare a global variable to accumulate incoming data
var
  entryData = ''; // Initialized as an empty string

// Resume the standard input stream to listen for data
process.stdin.resume();

// Set the encoding for the incoming data to UTF-8
process.stdin.setEncoding('utf8');

// Register an event listener for when data chunks are received
process.stdin.on('data', function (dataPiece)
{
  // Append each incoming dataPiece to the entryData string
  entryData += dataPiece;
});

// Register an event listener for when the input stream ends
process.stdin.on('end', function ( )
{
  // Split the accumulated entryData by newline characters into an array of strings
  entryData = entryData.split('\n');
  // Call the primary processing routine to begin calculations
  calcProc();
});