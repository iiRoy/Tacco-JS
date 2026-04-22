// This script initializes a Node.js application to read input from the standard input stream.
// It then processes the received data to perform a specific calculation and outputs the result.
// This is a basic example demonstrating asynchronous input handling and simple arithmetic.

process.stdin.resume(); // Ensures the standard input stream remains active for reading.


process.stdin.setEncoding('utf8'); // Configures the input stream to decode incoming data as UTF-8 text.


var lines = []; // Declares an array to sequentially store each line of input read from stdin.


// Creates an instance of the readline interface to facilitate line-by-line input processing.
var reader = require('readline').createInterface(
  {
    input:  process.stdin,  // Specifies standard input as the source for readline.
    output: process.stdout  // Specifies standard output for any readline-related output (not directly used here for echoing).
  }
);


// Attaches an event listener to the 'line' event, which is triggered each time a new line of input is received.
reader.on('line', (line) => {
  // When a line is read, it is appended to the 'lines' array for later processing.
  lines.push(line);
});


// Attaches an event listener to the 'close' event, which is triggered when the input stream ends.
// This block contains the core logic to be executed after all input has been collected.
reader.on('close', () => {

  // The first line of input is expected to contain space-separated values.
  // This line splits the first element of the 'lines' array by spaces.
  var w = lines[0].split(' ');

  // Note: The following parseInt calls will parse the arrays [0], [1], [2] to their string representations "0", "1", "2" respectively,
  // resulting in n=0, x=1, t=2. This is based on the exact expression from the original code.
  var n = parseInt([0]); // Parses the string representation of array [0] into an integer.
  var x = parseInt([1]); // Parses the string representation of array [1] into an integer.
  var t = parseInt([2]); // Parses the string representation of array [2] into an integer.


  // Performs a mathematical calculation based on the values of n, x, and t.
  // Math.floor ensures the result of n/x is rounded down before adding 1.
  var c = Math.floor(n / x + 1) * t;


  // Outputs the final calculated value 'c' to the console.
  console.log(c);
});