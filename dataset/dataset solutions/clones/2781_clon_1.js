/*
 * This JavaScript code snippet handles input processing and performs
 * a specific calculation based on the input data.
 *
 * It utilizes Node.js 'readline' module for asynchronous input handling.
 */

// Resume the standard input stream to listen for data.
process.stdin.resume();

// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');


// Initialize an array to store each line read from stdin.
var lines = [];

/*
 * Create a readline interface.
 * This interface will read input from process.stdin
 * and write output to process.stdout (though output is not used in this specific example).
 */
var reader = require('readline').createInterface(
 {
    input: process.stdin,  // Standard input stream
    output: process.stdout // Standard output stream
 }
);


// Event listener for each line of input received.
reader.on(
 'line',
 (line) => {
  // Push the received line into the 'lines' array.
  lines.push(line)
 }
);


/*
 * Event listener for the 'close' event, which is emitted when
 * the input stream ends (e.g., when the user presses Ctrl+D or input file ends).
 */
reader.on(
 'close',
 () => {

  // Parse the second line of input (index 1) which contains space-separated numbers.
  // Split the string by spaces to get an array of string numbers.
  var n = lines[1].split(' ');

  // Iterate over the array 'n' and convert each string element to an integer.
  for (var k in n)
  {
   n[k] = parseInt(n[k])
  }

  // Initialize a counter 'r' to zero. This will store the final result.
  var r = 0;


  // Iterate through the array 'n' again to perform the main calculation.
  for (var k in n)
  {
   // Convert the key 'k' (which is a string) to an integer.
   k = parseInt(k);

   // Skip the first and last elements of the array 'n'.
   // The problem definition implies processing only internal elements.
   if (k === 0 || k === n.length - 1)
   {
    continue; // Move to the next iteration of the loop.
   }


   // Create a temporary array 'ary' containing three consecutive elements:
   // the element before the current one, the current one, and the element after the current one.
   var ary = [
    n[k - 1], // Element at index k-1
    n[k],     // Element at index k (current)
    n[k + 1]  // Element at index k+1
   ];


   // Sort the 'ary' array in ascending order.
   ary = ary.sort();

   // Check if the middle element of the sorted 'ary' is equal to the original n[k].
   // If it is, it means n[k] was the median of the three elements.
   if (ary[1] === n[k])
   {
    r++; // Increment the counter 'r' if n[k] is the median.
   }
  }


  // Finally, print the total count 'r' to the console.
  console.log(r)

 }
);