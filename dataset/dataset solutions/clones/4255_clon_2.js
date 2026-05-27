(function () {
  'use strict';

  // Array to store all incoming lines from standard input
  let inputStrings = [];

  // Set up interface for reading input line by line
  require('readline')
    .createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    .on('line', function (singleLine) {
      // Add each received line to our collection
      inputStrings.push(singleLine);
    });

  // Once all input has been received (end of stdin stream)
  process.stdin.on('end', function () {
    // Begin processing the collected input data

    // Parse the first line as an integer to set the upper limit
    let limitValue = parseInt(inputStrings[0]);
    // Initialize a variable to hold the largest square found
    let finalResult = 0;

    // Iterate from zero up to the limit value
    for (let loopIndex = 0; loopIndex <= limitValue; loopIndex++) {
      // Calculate the square of the current index
      let squaredValue = loopIndex * loopIndex;

      // If the calculated square is within the limit, update the result
      if (squaredValue <= limitValue) {
        finalResult = squaredValue;
      }
    }

    // Output the final calculated result to the console
    console.log(finalResult);

    // End of input processing logic
  });
})();
