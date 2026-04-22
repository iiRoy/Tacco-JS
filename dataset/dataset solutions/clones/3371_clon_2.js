function analyzeEntries(dataLines)
{
  // Extract and parse initial configuration parameters from the first line of input.
  var initialConfig = dataLines[0].split(' ');
  var totalItemsStr = initialConfig[0]; // This particular value is not utilized by the core logic.
  var requiredHeight = parseInt(initialConfig[1], 10); // Convert string to integer for minimum height constraint.
  var requiredWidth  = parseInt(initialConfig[2], 10); // Convert string to integer for minimum width constraint.
 
  // Initialize a counter to keep track of entries that satisfy the conditions.
  var eligibleItems = 0;
  
  // Iterate through the subsequent data lines, starting from the second line (index 1).
  for ( var currentIdx = 1; currentIdx < dataLines.length; currentIdx++ )
  {
    var entryLine = dataLines[currentIdx].split(' '); // Divide the current line string into individual components.
    var itemHeight = parseInt(entryLine[0], 10); // Obtain and parse the height dimension of the current item.
    var itemWidth  = parseInt(entryLine[1], 10); // Obtain and parse the width dimension of the current item.
    
    // Evaluate if the item's dimensions meet both specified minimum requirements.
    if ( itemHeight >= requiredHeight && itemWidth >= requiredWidth )
    {
      eligibleItems++; // Increment the counter if the item is deemed eligible.
    }
  }

  // Display the final tally of items that met the criteria to the console.
  console.log(eligibleItems);
}


// This support function parses a space-separated string of numbers into an array of integers.
function interpretLineAsNumbers(textRow)
{
  var resultArray = []; // An array designated to hold the converted numeric values.
  var tokenizedLine = textRow.split(' '); // Break the input string into an array of string tokens using space as a delimiter.
  
  // Traverse through each token generated from the input string.
  for ( var partIndex = 0; partIndex < tokenizedLine.length; partIndex++ )
  {
    resultArray.push(parseInt(tokenizedLine[partIndex], 10)); // Parse each token as an integer and add it to the result array.
  }
  return resultArray; // Return the array containing the parsed integer values.
}

// A global variable used to accumulate all received standard input data.
var allInputBuffer = '';

// Activate the standard input stream to begin receiving data.
process.stdin.resume();
// Configure the character encoding for the standard input stream.
process.stdin.setEncoding('utf8');

// Attach an event listener to handle incoming data chunks from standard input.
process.stdin.on('data', function(incomingData)
{
  allInputBuffer += incomingData; // Concatenate the new data chunk to the existing buffer.
});

// Attach an event listener to execute a function once the standard input stream has ended.
process.stdin.on('end', function()
{
  // Divide the complete accumulated input buffer into an array of individual lines.
  var processedLines = allInputBuffer.split('\n');
  // Invoke the primary data processing function with the prepared array of lines.
  analyzeEntries(processedLines);
});