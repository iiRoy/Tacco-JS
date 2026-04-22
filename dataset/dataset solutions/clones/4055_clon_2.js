// This module processes the input text to calculate a specific maximum value.
function ProcessInputData(rawData)
{
  var lines = rawData.split('\n'); // Split the entire input into individual lines.
  var itemQuantity = parseInt(lines[0]); // Convert the first line to an integer representing the count.

  // Parse the second line into an array of string tokens.
  var firstLineTokens = lines[1].split(' ');
  // Parse the third line into another array of string tokens.
  var secondLineTokens = lines[2].split(' ');

  // Initialize a 2D array (matrix) to store numerical data.
  var valueMatrix = new Array();
  valueMatrix[0] = new Array();
  valueMatrix[1] = new Array();


  // Populate the 2D array with parsed integer values from the token arrays.
  for (  var rowIdx = 0; rowIdx < 2; rowIdx++ )
  {
    for ( var colIdx = 0; colIdx < itemQuantity; colIdx++ ) {
      if ( rowIdx === 0 ) {
        valueMatrix[rowIdx][colIdx] = parseInt(firstLineTokens[colIdx]);
      } else if ( rowIdx === 1 ) {
        valueMatrix[rowIdx][colIdx] = parseInt(secondLineTokens[colIdx]);
      }
    }
  }

  // Calculate the maximum possible sum based on specific traversal logic.
  var overallMaximum = 0;
  for ( var currentOffset = 0; currentOffset <= itemQuantity - 1; currentOffset++ )
  {
    var currentTotal = 0;

    // Sum elements from the first row up to a certain point.
    for ( var firstLoopIdx = 0; firstLoopIdx <= itemQuantity - 1 - currentOffset; firstLoopIdx++ ) {
      currentTotal += valueMatrix[0][firstLoopIdx];
    }

    // Sum elements from the second row from a certain point onwards.
    for ( var secondLoopIdx = itemQuantity - 1 - currentOffset; secondLoopIdx <= itemQuantity - 1; secondLoopIdx++ ) {
      currentTotal += valueMatrix[1][secondLoopIdx];
    }

    // Update the overall maximum if the current total is greater.
    if ( currentTotal > overallMaximum ) {
      overallMaximum = currentTotal;
    }
  }

  // Output the final calculated maximum value.
  console.log(overallMaximum);
}
// Do not modify the following section (standard input reading and function invocation).
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));