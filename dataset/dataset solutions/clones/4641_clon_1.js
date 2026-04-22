// This script processes input from standard input to determine a pattern.
process.stdin.resume(); // Initiates the standard input stream to prevent the process from exiting.

// Ensure the standard input is set to UTF-8 encoding for proper character handling.
process.stdin.setEncoding('utf8');


// Attach an event listener to the 'data' event of standard input.
// This function will be called whenever new data is available from stdin.
process.stdin.on('data', function (chunk) {
  // Convert the incoming data chunk to a string and split it by spaces.
  // This assumes the input numbers are space-separated.
  var lines = chunk.toString().split(' ');

  // Extract the first three elements from the 'lines' array.
  // These are expected to be the numbers for comparison.
  var first  =  lines[0];
  var second = lines[1];
  var third  = lines[2] ;

  // Calculate the difference between the second and first numbers.
  // This is the first common difference candidate.
  var dif_1to2 = second - first;
  // Calculate the difference between the third and second numbers.
  // This is the second common difference candidate.
  var dif_2to3 = third - second;

  // Check if the two calculated differences are strictly equal.
  // This determines if the input numbers form an arithmetic progression.
  if (dif_1to2 === dif_2to3) { // Condition check for an arithmetic sequence
    // If the differences are equal, it means the numbers form an arithmetic progression.
    console.log("YES");
  } else { // If the differences are not equal, it's not an arithmetic progression.
    // Otherwise, print "NO".
    console.log("NO");
  }

  /*
   * The following line is commented out but could be used for debugging purposes
   * to inspect the parsed input lines array and verify the data.
   */
  // console.log("Parsed input lines array:", lines); // Original comment modified and expanded
});
// End of script execution flow.