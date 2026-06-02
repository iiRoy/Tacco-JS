(function() {
    'use strict'; // Activate strict mode for improved code quality

    // A dynamic array to accumulate each line of input received
    var inputData = [];

    // Initialize the readline interface to handle standard input and output
    require('readline').createInterface({
      input: process.stdin,  // Designate standard input as the source
      output: process.stdout // Designate standard output (though not directly used for output here)
    }).on('line', function(currentInputLine) {
      // For every line read, append it to our input data buffer
      inputData.push(currentInputLine);
    });

    // Attach an event listener for the 'end' event of the standard input stream
    process.stdin.on('end', function() {
      // The following block of code was commented out in the original source.
      // It remains commented out here to maintain identical behavior.
      /*
      inputData.forEach(function(currentInputLine) {
        var tokens = currentInputLine.split(' ').map(Number);
        console.log(tokens[0] + ' ' + tokens[1]);
      });
      */

      // Begin the core processing logic for the problem
      // Split the first line of input by spaces. Even if it's a single number,
      // this will result in an array like ["12345"].
      var processedInputArray = inputData[0].split(" ");

      // Determine the length of the string representation of the processed array.
      // For example, if processedInputArray is ["12345"], (processedInputArray + '')
      // becomes "12345", and its length is 5.
      var stringifiedLength = (processedInputArray + '').length;

      // Initialize a variable to store the sum of the digits
      var calculatedDigitSum = 0;

      // Iterate through each character of the stringified array
      // and convert it to an integer, adding it to the running sum.
      for (var charIndex = 0; charIndex < stringifiedLength; charIndex++) {
        calculatedDigitSum += parseInt((processedInputArray + '')[charIndex]);
      }

      // Compute the remainder of the processed input array (coerced to a number)
      // when divided by the calculated sum of its digits.
      // JavaScript's type coercion will convert ["12345"] to the number 12345 for this operation.
      var finalRemainder = processedInputArray % calculatedDigitSum;

      // An original debug line, kept commented to preserve behavior.
      // console.log(calculatedDigitSum);

      // Check if the computed remainder is exactly zero
      if (finalRemainder == 0) {
          console.log("Yes"); // If it is zero, print "Yes"
      } else {
        console.log("No"); // Otherwise, print "No"
      }

      // Another original debug line, kept commented.
      // console.log( Math.pow(parseInt(inputData[0]),2) - parseInt(inputData[1]) );
      // End of the main processing logic
    });

})();
