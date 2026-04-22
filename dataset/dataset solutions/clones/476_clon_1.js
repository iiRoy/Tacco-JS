function main()
{
  var i = 0; /* Initialize an index for iterating through the input array. */

  // This is the main loop that processes multiple test cases from the input.
  // It continues indefinitely until a specific break condition is met.
  while (true)
  {
    /* Split the current line of input into components based on spaces. */
    var fieldInfo = input[i].split(' ');
    /* Extract the width and convert it to a number. */
    var width = fieldInfo[0] - 0;
    /* Extract the height and convert it to a number. */
    var height = fieldInfo[1] - 0;

    // Check if both width and height are zero, which signals the end of input.
    if ( ! width && ! height )
    {
      break; /* Terminate the processing loop. */
    }

    var start; // Variable to hold the starting position coordinates.
    var goal;  // Variable to hold the goal position coordinates.

    // 'elem' is a 2D array designed to store the positions of different element types.
    // It's initialized with 5 empty sub-arrays, one for each element type (0-4).
    var elem = [ [], [], [], [], [] ];
    // Explicitly ensure all sub-arrays are empty and ready for population.
    for ( var ei = 0; ei < 5; ei++ )
    {
      elem[ei].length = 0; // Reset length to zero for clarity.
    }

    // Loop through the grid rows, from 'height - 1' down to '0'.
    for ( var y = height; y--; )
    {
      i++; // Advance the input line pointer to the next row of the grid.
      // Loop through the grid columns, from 'width - 1' down to '0'.
      for ( var x = width; x--; )
      {
        var c = input[i][x]; // Retrieve the character at the current grid cell.

        // A switch statement handles different types of characters found in the grid.
        switch ( c )
        {
          case '.': // A dot represents an empty or traversable space.
            break; // No specific action is required for empty spaces.
          case 'S': // 'S' denotes the starting position.
            start = pos(x, y); // Store the encoded position of 'S'.
            break;
          case 'G': // 'G' denotes the goal position.
            goal = pos(x, y);  // Store the encoded position of 'G'.
            break;
          default : // Any other character (presumably '1' through '5') represents an element.
            // Convert the character to a 0-indexed integer (e.g., '1' -> 0, '2' -> 1).
            // Then, store the encoded position in the corresponding element array.
            elem[c - 1][elem[c - 1].length] = pos(x, y);
            break;
        }
      }
    }

    // A large integer value representing infinity, used for distance initialization.
    var INF = 1 << 30;
    var bestElement = -1; // Stores the 1-indexed type of the first element in the optimal path.
    var distance = INF;   // Stores the minimum total distance found, initialized to infinity.

    // Iterate through each possible element type (0 to 4) to be the "starting" element
    // for the sequence of captures.
    for ( var startElem = 0; startElem < 5; startElem++ )
    {
      // Initialize a dynamic programming (DP) table.
      // dp[element_type_idx][instance_idx] will store the minimum distance to reach that instance.
      var dp = [ [], [], [], [], [] ];
      for ( var h = 0; h < 5; h++ )
      {
        var hLength = elem[h].length; // Get the total number of instances for this element type.
        dp[h].length = hLength;       // Set the length of the DP sub-array to match.
        for ( var hidx = 0; hidx < hLength; hidx++ )
        {
          dp[h][hidx] = INF; // Initialize all distances in the DP table to infinity.
        }
      }

      // Calculate the index of the first element type to be captured in the sequence.
      // This is 'startElem + 1', wrapped around using modulo 5.
      var first = (startElem + 1) % 5;

      var firstLength = elem[first].length; // Number of instances of the 'first' element type.
      // Calculate initial distances from the global 'start' point to each instance
      // of the 'first' element type.
      for ( var j = 0; j < firstLength; j++ )
      {
        dp[first][j] = dist(start, elem[first][j]);
      }

      // This loop iterates three times to connect four elements in sequence:
      // (s -> first) -> (first -> second) -> (second -> third) -> (third -> fourth).
      for ( var e = 0; e < 3; e++ )
      {
        var now = (first + e) % 5;     // The current element type in the sequence.
        var next = (now + 1) % 5;      // The next element type to be captured.
        var nowLength = elem[now].length;   // Count of instances for the 'now' element type.
        var nextLength = elem[next].length; // Count of instances for the 'next' element type.

        // Iterate through all instances of the current element type.
        for ( var j = 0; j < nowLength; j++ )
        {
          // Iterate through all instances of the next element type.
          for ( var k = 0; k < nextLength; k++ )
          {
            // Update the minimum distance to reach 'elem[next][k]'
            // by considering paths that go through 'elem[now][j]'.
            dp[next][k] = fmin(
              dp[next][k],                             // The current minimum distance to elem[next][k].
              dp[now][j] +                             // Distance to reach elem[now][j].
                  dist(elem[now][j], elem[next][k]) ); // Plus the distance from elem[now][j] to elem[next][k].
          }
        }
      }

      // After calculating distances through four elements, determine the last element type.
      var last = (first + 3) % 5; // This is the fourth element in the sequence.
      var lastLength = elem[last].length; // Number of instances of the 'last' element type.
      // Now, calculate the final leg: from the 'last' element to the 'goal'.
      for ( var j = 0; j < lastLength; j++ )
      {
        // Total distance for this specific path: start -> ... -> elem[last][j] -> goal.
        var d = dp[last][j] +
                    dist(elem[last][j], goal); // Add the distance from the last element instance to the goal.

        // If this path yields a shorter total distance, update the best result.
        if ( d < distance )
        {
          distance = d;              // Update the overall minimum distance.
          bestElement = startElem + 1; // Record the 1-indexed starting element type.
        }
      }
    }

    // Output the final result.
    if ( distance == INF )
    {
      console.log("NA"); // If 'distance' is still INF, no valid path was found.
    }
    else
    {
      console.log(bestElement + " " + distance); // Otherwise, output the best element and the minimum distance.
    }

    i++; // Move to the next line in the input, typically for the next field definition.
  } // End of the main while loop.


} // End of the main function.


// Calculates the Manhattan distance between two encoded positions.
// Positions are encoded as (x << 11) + y.
function dist(from, to)
{
  // Extract x-coordinates by right-shifting 11 bits.
  // Extract y-coordinates by bitwise AND with 2047 (0b11111111111), which masks the lower 11 bits.
  return fabs((from >> 11) - (to >> 11)) + fabs((from & 2047) - (to & 2047));
}


// Custom minimum function, potentially optimized using bitwise operations.
function fmin(a, b)
{
  var t = a - b; // Calculate the difference between 'a' and 'b'.
  // This expression returns 'b' if 'a >= b', and 'a' if 'a < b'.
  // (t >> 31) will be -1 if 't' is negative (a < b), and 0 if 't' is positive or zero (a >= b).
  // If t is negative, (t & -1) is t. So b + t = b + (a - b) = a.
  // If t is positive or zero, (t & 0) is 0. So b + 0 = b.
  return b + (t & (t >> 31));
}


// Encodes 2D coordinates (x, y) into a single integer.
// Y-coordinate occupies the lower 11 bits (0 to 2047).
// X-coordinate occupies bits from 11 upwards.
function pos(a, b)
{
  return (a << 11) + b; // Shift 'a' (x) left by 11 bits and add 'b' (y).
}


// Custom absolute value function using bitwise operations for integer types.
function fabs(a)
{
  var mask = a >> 31; // Generates a mask: -1 (all 1s) if 'a' is negative, 0 if 'a' is positive/zero.
  // If 'a' is positive: (a ^ 0) - 0 = a.
  // If 'a' is negative: (a ^ -1) - (-1) = (~a) + 1, which is the two's complement negation of 'a'.
  return (a ^ mask) - mask;
}


// Global variable to store all incoming standard input data.
var input = '';


// Set up event handlers for standard input stream.
process.stdin.resume(); // Ensures the Node.js process stays alive to receive input.
process.stdin.setEncoding('utf8'); // Specifies that the input data should be treated as UTF-8 encoded text.
process.stdin.on('data', function(chunk) {
  input += chunk; // Appends each received data chunk to the 'input' string.
});
process.stdin.on('end', function() {
  input = input.split('\n'); // Once all input is received, split it into an array of lines.
  main(); // Call the main function to begin the program's logic execution.
});