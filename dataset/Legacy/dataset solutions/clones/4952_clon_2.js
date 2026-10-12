(function () {
  // This immediately invoked function expression (IIFE) encapsulates the code
  // to prevent global scope pollution.
  'use strict'; // Enforces stricter parsing and error handling rules.

  // A dynamic array to accumulate all input lines received from the standard input stream.
  let receivedLines = [];

  // Initialize the readline interface to process input from the console.
  require('readline').createInterface({
    input: process.stdin, // Specifies standard input as the source.
    output: process.stdout // Specifies standard output (though not used for direct output by readline here).
  }).on('line', function (singleInputLine) {
    // Event listener for each line of input received.
    // Each incoming line is added to our collection.
    receivedLines.push(singleInputLine);
  });

  // Set up an event listener for when the standard input stream concludes.
  process.stdin.on('end', function () {
    // Once all input has been received, process the first line.
    // It extracts the first four characters, appends a space, and then appends the rest of the line.
    // The result is then printed to the console.
    console.log(receivedLines[0].substring(0, 4) + ' ' + receivedLines[0].substring(4));
  });
})();
