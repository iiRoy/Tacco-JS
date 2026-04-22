// This JavaScript program is designed to read input from standard input,
// process it according to specific rules, and then print a result to standard output.
// It leverages Node.js's 'readline' module for efficient input handling.

process.stdin.resume(); // Ensures the standard input stream remains open for data.

process.stdin.setEncoding('utf8'); // Configures the input stream to interpret data as UTF-8 encoded text.

// An array to accumulate all lines of input received.
var lines = [];

// Create a readline interface instance to manage input/output operations.
var reader = require('readline').createInterface({
  input:  process.stdin,  // The input source is the standard input stream.
  output: process.stdout  // The output destination is the standard output stream.
});

// Attach an event listener for each 'line' event.
// This function will be called every time a new line of input is available.
reader.on('line', (line) => {
  lines.push(line); // Add the current line of input to the 'lines' array.
});

// Attach an event listener for the 'close' event.
// This function executes once the input stream has ended.
reader.on('close', () => {

  // Initialize a counter to keep track of valid combinations found.
  var count = 0;

  // Parse the input values from the first line of input (lines[0]).
  // It's assumed that the first line contains four space-separated numbers: R, G, B, and LIMIT.
  var r     = Number(lines[0].split(" ")[0]); // Represents the 'r' coefficient.
  var g     = Number(lines[0].split(" ")[1]); // Represents the 'g' coefficient.
  var b     = Number(lines[0].split(" ")[2]); // Represents the 'b' coefficient.
  var limit = Number(lines[0].split(" ")[3]); // Represents the upper 'limit'.

  // Outer loop: iterates through possible values for 'i'.
  // The loop continues as long as r*i does not exceed the overall limit.
  for ( i = 0; i * r <= limit; i++ ) {

    // Inner loop: iterates through possible values for 'j'.
    // The loop continues as long as g*j does not exceed the overall limit.
    for ( j = 0; j * g <= limit; j++ ) {

      // Condition check:
      // 1. (limit - r*i - g*j) % b == 0: Checks if the remaining value (after accounting for r*i and g*j)
      //    is perfectly divisible by 'b'. This indicates an integer solution for 'k'.
      // 2. limit >= r*i + g*j: Ensures that the sum of r*i and g*j does not exceed the total limit.
      if ( ( limit - r * i - g * j ) % b == 0 && limit >= r * i + g * j ) {
        count++; // If both conditions are true, increment the counter.
        // Original debug comment: // console.log(r + ", " + g + ", " + (limit - r*i - g*j)/b );
        // This line was commented out in the original code, and remains so.
      }
      // If the current sum (r*i + g*j) already exceeds the limit,
      // further increments of 'j' will also exceed the limit.
      // Therefore, we can break out of the inner loop to optimize.
      else if ( limit < r * i + g * j ) {
        break; // Exit the current inner loop.
      }
    } // End of inner loop for 'j'.
  } // End of outer loop for 'i'.

  // After all combinations have been checked, print the total count of valid combinations.
  console.log(count);

}); // End of 'close' event handler.