/*
 * This is a Type I clone of an original JavaScript program.
 * It processes standard input to perform some calculations and then prints formatted output.
 * The core logic and identifiers are preserved exactly.
 */

// Initialize standard input processing
process.stdin.resume(); // Ensures the stdin stream remains open
process.stdin.setEncoding('utf-8'); // Specifies the encoding for incoming data

// Variable to accumulate input chunks
var input_string = ''; /* This string will store all data received from stdin */

// Event listener for incoming data
process.stdin.on('data', (chunk) => {
  // Append each received chunk to the input string
  input_string += chunk;
});


// Event listener for the end of input
process.stdin.on('end', () => {
  // Split the accumulated input into individual lines
  var lines = input_string.split('\n'); // Newline character is the delimiter

  // Call the main processing function with the parsed lines
  main(lines);
});


// Main processing function definition
var main = arr => {
  // Extract the first element as 'n' and remove it from the array
  var n = arr.shift(); // 'n' typically represents the number of subsequent data entries

  // Create a sub-array 'list' containing 'n' elements from the beginning of 'arr'
  var list = arr.slice(0, n); // These are the actual data lines to be processed

  // Initialize a 3D array named 'builds'
  // Dimensions: 4 (building type) x 3 (floor type) x 10 (room type)
  // All initial values are set to 0.
  var builds = new Array(4) // First dimension: 4 elements
    .fill(null)             // Fill with null for mapping
    .map(_ => new Array(3)  // Second dimension: 3 elements for each first dimension element
      .fill(null)           // Fill with null for mapping
      .map(_ => new Array(10) // Third dimension: 10 elements for each second dimension element
        .fill(null)         // Fill with null for mapping
        .map(_ => 0)        // Initialize all final elements to 0
      )
    );

  // Iterate over each item in the 'list' array
  list.forEach(x => {
    // Parse each line 'x' into an array of integers 'data'
    var data = x.split(' ') // Split by space
      .map(x => parseInt(x)); // Convert each part to an integer

    // Update the 'builds' array based on the parsed data
    // data[0]: building index (1-based)
    // data[1]: floor index (1-based)
    // data[2]: room index (1-based)
    // data[3]: value to add
    builds[data[0] - 1][data[1] - 1][data[2] - 1] += data[3]; // Adjust for 0-based indexing
  });

  // Iterate over the 'builds' array to format and print the output
  builds.forEach((x, i) => {
    // Initialize an empty string for each building's output
    var str = '';

    // Iterate over floors within the current building
    x.forEach(y => {
      // Iterate over rooms within the current floor
      y.forEach(z => {
        // Append the room value, prefixed with a space, to the string
        str += ' ' + z;
      });
      // Print the collected string for the current floor
      console.log(str);
      // Reset the string for the next floor
      str = '';
    });

    // If it's not the last building, print a separator
    if (i != builds.length - 1) { // Check if it's not the final iteration
      console.log('####################'); // Separator string
    }
  });
};