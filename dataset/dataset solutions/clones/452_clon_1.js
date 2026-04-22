/*
 * This JavaScript file contains logic for processing input data,
 * likely related to a card game or similar sequence analysis.
 * The 'main' function handles the core processing.
 */
function main()
{
  // Variable declarations for the main function scope.
  var
    hands, // An array to hold the current set of 'cards' or numbers.
    pattern, // An object to track unique values within 'hands'.
    swap, // A temporary variable for value swapping operations.
    i = 0, // An index for iterating through the global 'input' array, initialized to zero.
    j; // A loop counter for inner loops.

  // This is an infinite loop that processes data until a specific break condition is met.
  for (;;)
  {
    // Check if the current element in the 'input' array is 0.
    // This value acts as a sentinel to signal the end of processing.
    if (input[i] == 0)
    {
      break; // Exit the loop if the sentinel value is encountered.
    }


    // Initialize 'hands' as an empty array for the current iteration.
    hands = [];
    // Loop to populate the 'hands' array with five consecutive values from 'input'.
    for (j = 0; j < 5; j++)
    {
      // Convert the input string value to a number and add it to the 'hands' array.
      // The 'i' index is incremented immediately after use (post-increment).
      hands.push(Number(input[i++])); // Push the number into the array.
    }

    // Use the 'reduce' method to create a 'pattern' object.
    // This object will have properties corresponding to the unique values in 'hands',
    // with their values set to 'true', effectively creating a set of unique numbers.
    pattern = hands.reduce(function (pat, h)
    {
      // Assign 'true' to the property 'h' of 'pat' and then return 'pat'.
      return (pat[h] = true, pat);
    }, {}); // The initial value for 'pat' is an empty object.

    // Extract the keys (unique numbers) from the 'pattern' object,
    // convert them to numbers (as Object.keys returns strings),
    // and then sort them numerically in ascending order.
    keys = Object.keys(pattern).map(Number).sort(function (x, y)
    {
      // The comparison function for sorting numbers.
      return x - y;
    });


    // Check if there are exactly two unique values in the 'keys' array.
    if (keys.length === 2)
    {
      // If there are two unique values, further check if their difference is 2.
      // This implies values like (1, 3) or (2, 4), etc.
      if (keys[1] - keys[0] == 2)
      {
        // If the condition is met, swap the first and second elements in the 'keys' array.
        // This might be part of a specific game rule or ranking logic.
        swap = keys[0];
        keys[0] = keys[1];
        keys[1] = swap;
      }
      // Iterate over each hand in the 'hands' array.
      hands.forEach(function (h)
      {
        // Find the index of the current hand 'h' in the (possibly reordered) 'keys' array.
        // Add 1 to this index for a 1-based output (e.g., 1 or 2).
        console.log(keys.indexOf(h) + 1);
      });
    }
    else
    {
      // If the number of unique values is not exactly two,
      // then for each hand, output the number 3.
      // This could represent a default category or a different type of hand.
      hands.forEach(function ()
      {
        console.log(3);
      });
    }

  } // End of the 'for' loop.
} // End of the 'main' function.


// Global variable declaration for storing input data.
var
  input = ''; // Initialize 'input' as an empty string.

// Resume the standard input stream, allowing data to be read.
process.stdin.resume();
// Set the character encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');
// Attach an event listener for when data chunks are received from stdin.
process.stdin.on('data', function(chunk)
{
  // Append each incoming data chunk to the 'input' string.
  input += chunk;
});
// Attach an event listener for when the standard input stream ends.
process.stdin.on('end', function()
{
  // Once all input has been received, split the accumulated string into an array of lines.
  // Each line will be an element in the 'input' array.
  input = input.split('\n');
  // Call the 'main' function to begin processing the parsed input data.
  main();
});
// End of the script execution flow.