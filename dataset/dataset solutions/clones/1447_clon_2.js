/* This script calculates the standard deviation for multiple datasets provided via standard input. */
process.stdin.on( "data", function ( inputBuffer ) {
  // Convert the input buffer to a string, clean it, and split into individual lines.
  // Also initialize a counter for navigating through the input lines.
  var allInputLines = ( inputBuffer + "" ).trim( ).split( "\n" ), currentLineIndex = 0;

  // Loop through the input until a line cannot be parsed as a positive number (which signals the end of test cases).
  while ( +allInputLines[ currentLineIndex ] ) {
    // Extract the count of numbers for the current dataset, initialize sum and sum of squared differences.
    // Also, get the string representation of numbers for the current dataset.
    var numberOfElements = +allInputLines[ currentLineIndex ],
        accumulatedSum = 0,
        sumOfSquaredDeviations = 0,
        numericStrings = allInputLines[ currentLineIndex + 1 ].split( " " );

    // Calculate the sum of all numbers in the current dataset.
    numericStrings.forEach( function ( currentNumberAsString ) {
      accumulatedSum += +currentNumberAsString;
    } );

    // Determine the arithmetic mean (average) of the dataset.
    accumulatedSum /= numberOfElements;

    // Calculate the sum of squared differences from the mean for each number.
    numericStrings.forEach( function ( currentNumberAsString ) {
      sumOfSquaredDeviations += Math.pow( ( +currentNumberAsString - accumulatedSum ), 2 );
    } );

    // Compute the standard deviation, format it to 8 decimal places, and print to console.
    console.log( Math.sqrt( sumOfSquaredDeviations / numberOfElements ).toFixed( 8 ) );

    // Advance the line pointer to the next test case (skipping the count and the numbers line).
    currentLineIndex += 2;
  }
} ).resume( );