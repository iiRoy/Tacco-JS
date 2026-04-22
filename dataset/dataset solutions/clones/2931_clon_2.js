function processInputData ( rawData ) {
  // Process the incoming raw text data
  rawData = rawData.split('\n');

  // Parse numerical parameters from the first line
  var rateFactor = parseInt(rawData[0].split(' ')[0]);    // Coefficient for multiplication
  var decrementValue = parseInt(rawData[0].split(' ')[1]);  // Value to subtract
  var accumulatorValue = parseInt(rawData[0].split(' ')[2]); // Initial value for iteration

  // Loop for a fixed number of iterations
  for ( var loopCounter = 0; loopCounter < 10; loopCounter++ ) {
    accumulatorValue = ( rateFactor * accumulatorValue ) - decrementValue; // Apply the transformation
    console.log(accumulatorValue);                                     // Output the result of this step
  }

}

// Read input from standard input and pass it to the processing function
processInputData( require('fs').readFileSync('/dev/stdin', 'utf8') );