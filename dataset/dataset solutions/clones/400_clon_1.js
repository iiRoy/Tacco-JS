/*
 * This JavaScript code defines a function to count sequences of '1's
 * in a 2D array, and then processes input to find the maximum such sequence length.
 */

// Function to count consecutive '1's starting from a given (y, x) coordinate
// in various directions.
function    count  (y,x)  {
    // Define change in y-coordinate for 4 directions: horizontal, diagonal (up-left), vertical, diagonal (up-right)
   var dy = [0, 1, 1, 1];

   // Define change in x-coordinate for the same 4 directions
   var dx = [1, -1, 0, 1];

   // Initialize the maximum count found for the current (y,x) starting point
   var max = 1;

   // Loop through each of the 4 predefined directions
   for(    var i = 0;   i < 4;   i++    )    {
      // Initialize current count for the sequence in the current direction
      var cnt = 0;

      // Iterate along the current direction, starting from (y,x)
      // The variable 'n' is globally defined later in the main script.
      for( var j = 0; j <= n; j++ ) {

         // Calculate the new y-coordinate
         var yy = y + (dy[i] * j);

         // Calculate the new x-coordinate
         var xx = x + (dx[i] * j);

         // Check for out-of-bounds conditions
         if ( yy < 0 || xx < 0 || yy >= n || xx >= n ) {
             break; // Stop if outside the grid
         }

         // Check if the current cell contains a '1'
         // 'yx' is the global 2D array defined later.
         if ( yx[yy][xx] != 1 ) {
            break; // Stop if not a '1'
         }

         // Increment the count if it's a '1' and within bounds
         cnt++;
      }

      // Update the overall maximum count if the current direction's count is higher
      max = Math.max(max, cnt);

      // Reset count for the next direction (though it's re-initialized at the top of the loop)
      cnt = 0;
   }

   // Return the maximum sequence length found from this starting point
   return max;
}


// --- Main script execution starts here ---

// Read the entire input from standard input, assuming UTF-8 encoding.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim whitespace from the input and split it into an array of lines.
var Arr = (input.trim()).split("\n");

// Loop indefinitely until a specific condition is met (n=0)
while (true) {
   // Shift the first line from Arr, convert it to a number, and store in 'n'.
   // This 'n' defines the size of the square grid for the current test case.
   var n = Arr.shift() - 0;

   // If n is 0, it signifies the end of input, so break the loop.
   if (n == 0) {
       break;
   }

   // Initialize an empty array to store the 2D grid (matrix).
   var yx = [];

   // Populate the 'yx' grid based on the next 'n' lines of input.
   for (var i = 0; i < n; i++) {
      // Shift a line, split it into individual characters, and map them to numbers.
      yx[i] = (Arr.shift()).split("").map(Number);
   }

   // Initialize the overall maximum sequence length for the current test case.
   var max = 0;

   // Iterate through each cell of the 'yx' grid.
   for (var i = 0; i < n; i++) {
      for (var j = 0; j < n; j++) {
         // If the current cell contains a '1', call the 'count' function
         // to find the longest sequence starting from this point.
         if (yx[i][j] == 1) {
            // Update the overall maximum if 'count' returns a larger value.
            max = Math.max(max, count(i, j));
         }
      }
   }

   // Print the maximum sequence length found for the current test case to console.
   console.log(max);
}