( function () {
  'use strict';

  // Array to store all incoming lines from standard input
  let receivedInputLines = [];

  // Set up interface for reading input line by line
  require('readline')
    .createInterface({
      input: process.stdin,  // Source for input
      output: process.stdout // Destination for output (not used for actual output here, just for interface)
    })
    .on('line', function (currentInputSegment) {
      // Each time a line is received, add it to our collection
      receivedInputLines.push(currentInputSegment);
    });

  // When the standard input stream finishes
  process.stdin.on('end', function () {
    // The following section was previously commented out,
    // demonstrating a potential way to process multiple lines.
    /*
    receivedInputLines.forEach(function(aSingleLine) {
      let numericTokens = aSingleLine.split(' ').map(Number);
      console.log(numericTokens[0] + ' ' + numericTokens[1]);
    });
    */

    // --- Core calculation logic starts here ---
    // This part processes specific lines from the collected input.
    // It takes the first line, converts it to an integer, squares it.
    // Then it takes the second line, converts it to an integer, and subtracts it.
    let firstValue = parseInt(receivedInputLines[0]);
    let secondValue = parseInt(receivedInputLines[1]);

    // Calculate the result: (firstValue ^ 2) - secondValue
    let finalResult = Math.pow(firstValue, 2) - secondValue;

    // Output the computed result to the console.
    console.log(finalResult);
    // --- Core calculation logic ends here ---
  });

})();
