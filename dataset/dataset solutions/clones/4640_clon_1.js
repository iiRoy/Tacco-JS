/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain identical.
 * Only whitespace and comments have been altered extensively
 * to create a visually distinct but functionally identical version.
 */

//  The following section handles input/output operations.
//  It's generally considered boilerplate for competitive programming.

var  read = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var   obj; // Declares a variable to hold the input utility object.

var inLine = [ ]; // An array to store all lines read from standard input.

read.on('line', function (input) {
  // Callback function executed for each line of input received.
  inLine.push(input);
});


read.on('close', function ( ) {
  // This callback runs when all input has been received.

  obj = init( inLine ); // Initialize the input processing object.

  console.error("\n"); // Prints a newline to standard error, possibly for visual separation.

  var start = new Date( ); // Records the starting time for performance measurement.

  Main(); // Executes the primary logic of the program.

  var end = new Date() - start; // Calculates the elapsed time.


  myerr("time : " + (end) + "ms"); // Outputs the execution time to standard error.

  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB"); // Outputs memory usage.
});

// Utility function to create a deep clone of an object using JSON serialization.
function makeClone( obj ) { return JSON.parse( JSON.stringify( obj ) ); }

// Helper functions for parsing different types of input.
function nextInt( ) { return myconv( next( ), 1 ); }
function nextStrArray( ) { return myconv( next( ), 2 ); }
function nextIntArray( ) { return myconv( next( ), 4 ); }
function nextCharArray( ) { return myconv( next( ), 6 ); }

function next( ) { return obj.next( ); } // Retrieves the next line of input.
function hasNext( ) { return obj.hasNext( ); } // Checks if there's more input available.


function init( input ) {
  // Initializes an object for sequential input processing.
  var returnObj = {
    list: input,
    index: 0,
    max: input.length,

    hasNext: function ( ) { return (this.index < this.max); }, // Method to check for more input.

    next: function ( ) {
      // Method to get the next input line.
      if ( !this.hasNext( ) ) {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ"; // Error if no more input.
      } else {
        var returnInput = this.list[this.index];
        this.index++;
        return returnInput;
      }
    }
  };
  return returnObj; // Returns the initialized input object.
}

function myout(s) { console.log(s); } // Outputs to standard output.

function myerr(s) {
  console.error("debug:" + require("util").inspect(s, false, null)); // Outputs debug info to standard error.
}

/*
 * This function provides various conversion utilities for input data.
 * The 'no' parameter determines the type of conversion.
 *
 * Cases:
 * 1: Convert to integer.
 * 2: Split by space into a string array.
 * 4: Split by space and convert to an array of numbers.
 * 6: Split by character into a character array.
 * 7: Split by character and convert to an array of numbers.
 * 8: Join array elements with spaces.
 * 9: Join array elements with newlines.
 * 0: Join array elements without any separator.
 * Default: Return input as is.
 *
 * Error handling: If conversion fails, the original input 'i' is returned.
 */
function myconv(i, no) {
  try {
    switch (no) {
      case 1:
        return parseInt(i);
      case 2:
        return i.split(" ");
      case 4:
        return i.split(" ").map(Number);
      case 6:
        return i.split("");
      case 7:
        return i.split("").map(Number);
      case 8:
        return i.join(" ");
      case 9:
        return i.join("\n");
      case 0:
        return i.join("");
      default:
        return i;
    }
  } catch (e) {
    return i;
  }
}

/*
 * This is the main function containing the problem's core logic.
 * It's designed to solve a specific algorithmic problem.
 */
function Main( ) {
  var one = nextIntArray( ); // Reads the first line, which contains N and K, as an array of integers.
  var N = one[0]; // Extracts the first value, N.
  var K = one[1]; // Extracts the second value, K.

  var list = nextIntArray( ); // Reads the main list of numbers.

  var output = Math.pow(10, 16); // Initializes 'output' with a very large number, representing infinity.

  // Special case: If K is 1, no operations are needed, the cost is 0.
  if (K == 1) {
    myout(0); // Output 0.
    return; // Exit the function early.
  }

  // Iterate through all possible subsets of the list (represented by a bitmask).
  for (var i = 0; i < (1 << N); i++) {
    var selected = [list[0]]; // Start with the first element always selected.

    // Build the 'selected' subset based on the current bitmask 'i'.
    for (var j = 1; j < N; j++) {
      if ((i & (1 << j)) != 0) { // Check if the j-th bit is set in 'i'.
        selected.push(list[j]); // If set, include the j-th element from the original list.
      }
    }

    // Process only if the selected subset has at least K elements.
    if (selected.length >= K) {
      var sum = 0; // Initialize sum for the current subset.

      // Iterate through the selected elements to calculate the cost.
      for (var j = 1; j < selected.length; j++) {
        // If the current element is not strictly greater than the previous, adjust it.
        if (selected[j - 1] >= selected[j]) {
          // Calculate the cost to make selected[j] strictly greater than selected[j-1].
          sum += selected[j - 1] - selected[j] + 1;
          // Update selected[j] to be strictly greater for subsequent comparisons.
          selected[j] = selected[j - 1] + 1;
        }
      }
      // Update the overall minimum output with the sum for this subset.
      output = Math.min(output, sum);
    }
  }

  myout(output); // Print the final minimum cost.
}