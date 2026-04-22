/*
 * This script is designed to process input from the standard input stream.
 * It uses the 'readline' module to handle line-by-line input.
 */

// Ensure the standard input stream remains open.
process.stdin.resume();


// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');


// Initialize an array to store all incoming lines of input.
var lines = [];


/*
 * Create an interface for reading input line by line.
 * This interface uses process.stdin for input and process.stdout for output.
 */
var reader = require('readline').createInterface(
  {
    // Configure the input stream.
    input  :   process.stdin,

    // Configure the output stream.
    output :   process.stdout
  }
);


/*
 * Register an event listener for the 'line' event.
 * This callback function will be executed every time a new line of input is received.
 */
reader.on('line',
  (line) =>
  {
    // Add the received line to the 'lines' array.
    lines.push(line);
  }
);


/*
 * Register an event listener for the 'close' event.
 * This callback function runs once the input stream has ended.
 */
reader.on('close',
  () =>
  {
    // Parse the first line as an integer for variable 'n'.
    var n = Number(lines[0]);

    // Parse the second line as an integer for variable 'k'.
    var k = Number(lines[1]);

    // Split the third line by spaces to get an array of strings.
    var x = lines[2].split(' ');

    // Convert each string in the 'x' array to a Number.
    x = x.map(function(str) { return Number(str); });

    // Initialize the answer variable.
    var ans = 0;


    /*
     * Iterate through the array 'x' from index 0 up to (but not including) 'n'.
     * This loop calculates the sum based on conditions involving 'k'.
     */
    for (i = 0; i < n; i++)
    {
      /*
       * If the current element of 'x' is less than half of 'k' (rounded down),
       * add twice its value to 'ans'.
       */
      if (x[i] < Math.floor(k / 2))
      {
        ans += x[i] * 2;
      }
      /*
       * Otherwise, if the current element of 'x' is greater than half of 'k',
       * add twice the difference between 'k' and x[i] to 'ans'.
       * Note: The problem statement implies specific logic for values equal to k/2,
       * but this 'else if' explicitly handles only values strictly greater than k/2.
       */
      else if (x[i] > (k / 2))
      {
        ans += (k - x[i]) * 2;
      }
      // If x[i] is exactly k/2, nothing is added to ans, effectively adding 0.
    }

    // Print the final calculated answer to the console.
    console.log(ans);
  }
);