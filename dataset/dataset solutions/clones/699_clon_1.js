/*
 * This file contains JavaScript code to process geometric shapes.
 * It's designed to identify shapes that are identical after certain transformations.
 *
 * Global variable 'k' is used as an index for input processing.
 */

var k = 0; // Initialize a global counter for input array traversal.

/*
 * Function: route90
 * Description: Rotates a set of 2D points (x,y) by 90 degrees clockwise.
 * Parameters:
 *   x - An array representing the x-coordinates of points.
 *   y - An array representing the y-coordinates of points.
 *   m - The number of points to process.
 */
function route90( x , y , m )
{
  // Loop through each point from index 1 up to 'm' (inclusive).
  for ( var i = 1; i <= m; i++ )
  {
    /*
     * Store the current x-coordinate in a temporary variable 'a'.
     * Calculate the new y-coordinate 'b'. If the original y-coordinate
     * is 0, the new one is 0; otherwise, it's the negative of the original y.
     * This effectively swaps x and y and negates the new y.
     */
    var a = x[i];
    var b = y[i] == 0 ? 0 : y[i] * ( -1 );

    // Assign the new coordinates back to the arrays.
    x[i] = b;
    y[i] = a; // The original x becomes the new y.
  }

  // End of route90 function.
}


/*
 * Function: inline
 * Description: Parses input data for a shape, normalizes its coordinates,
 *              and applies initial rotations if necessary.
 * Parameters:
 *   x     - An array of arrays to store x-coordinates for multiple shapes.
 *   y     - An array of arrays to store y-coordinates for multiple shapes.
 *   n     - The index of the current shape being processed.
 *   m     - An array to store the number of points for each shape.
 *   input - The raw input data as an array of strings.
 */
function inline(x , y , n , m , input)
{
  // First, parse the number of points for the current shape (m[n]).
  // The 'k' index is incremented after use.
  m[n] = parseInt(input[k++] , 10);

  // Initialize arrays for x and y coordinates for the current shape.
  x[n] = [];
  y[n] = [];

  // Iterate to read and process each point of the current shape.
  for ( var i = 1 ; i <= m[n] ; i++ )
  {
    // Split the current input line (at index 'k') by space to get individual coordinates.
    input[k] = input[k].split(" ");

    // Parse the x-coordinate from the first part of the split string.
    x[n][i] = parseInt(input[k][0] , 10);

    // Parse the y-coordinate from the second part, then increment 'k'.
    y[n][i] = parseInt(input[k++][1] , 10);

    /*
     * For points after the first one, normalize their coordinates
     * by subtracting the coordinates of the first point.
     * This makes the first point (0,0) and translates the shape
     * relative to its starting point.
     */
    if (i > 1)
    {
      x[n][i] -= x[n][1];
      y[n][i] -= y[n][1];
    }
  }

  // Explicitly set the first point's coordinates to (0,0) after normalization.
  x[n][1] = 0;
  y[n][1] = 0;

  // Apply rotations based on the second point's coordinates (y[n][2] and x[n][2]).
  // This helps standardize the orientation of the shape.
  // If y-coordinate of the second point is positive, rotate.
  if ( y[n][2] > 0 )
  {
    route90(x[n] , y[n] , m[n]);
  }

  // If x-coordinate of the second point is negative, rotate.
  if ( x[n][2] < 0 )
  {
    route90(x[n] , y[n] , m[n]);
  }

  // If y-coordinate of the second point is negative, rotate.
  if ( y[n][2] < 0 )
  {
    route90(x[n] , y[n] , m[n]);
  }

  // End of inline function.
}


/*
 * Function: inv
 * Description: Inverts the order of points in a shape and then normalizes
 *              their coordinates relative to the new first point.
 *              Also applies rotations similar to the 'inline' function.
 * Parameters:
 *   x - An array representing the x-coordinates of points for a single shape.
 *   y - An array representing the y-coordinates of points for a single shape.
 *   m - The number of points in the shape.
 */
function inv(x , y , m)
{
  // Create temporary arrays to hold original coordinates.
  var x1 = [],
      y1 = [];

  // Copy original coordinates to temporary arrays.
  for ( var i = 1 ; i <= m ; i++ )
  {
    x1[i] = x[i];
    y1[i] = y[i];
  }

  /*
   * Reorder and normalize points:
   * The new i-th point becomes the (m - i + 1)-th point from the original,
   * translated such that the new last point (which was the original first point)
   * becomes the origin (0,0).
   */
  for ( var i = 1 ; i <= m ; i++ )
  {
    x[i] = x1[m - i + 1] - x1[m]; // Subtract x-coordinate of original last point.
    y[i] = y1[m - i + 1] - y1[m]; // Subtract y-coordinate of original last point.
  }

  // Apply rotations based on the second point's coordinates after inversion.
  // These are the same rotation checks as in the 'inline' function.
  if (y[2] > 0)
  {
    route90(x , y , m);
  }

  if (x[2] < 0)
  {
    route90(x , y , m);
  }

  if (y[2] < 0)
  {
    route90(x , y , m);
  }

  // End of inv function.
}


/*
 * Function: Main
 * Description: The primary function that orchestrates the processing
 *              of multiple shapes from the input. It reads shapes,
 *              normalizes them, and compares them to the first shape
 *              to find matches.
 * Parameters:
 *   input - The raw input string containing all shape data.
 */
function Main(input)
{
  // Split the input string into an array of lines.
  input = input.split("\n");

  // Main loop to process multiple sets of shapes until a termination condition is met.
  while (1)
  {
    // Read the number of shapes 'n' for the current set.
    // 'k' is incremented after reading.
    var n = parseInt(input[k++] , 10);

    // If 'n' is 0, it signifies the end of input, so break the loop.
    if ( n == 0 )
    {
      break;
    }

    // Initialize arrays to store shape data for the current set.
    var m = []; // Stores number of points for each shape.
    var x = [], // Stores x-coordinates (array of arrays).
        y = []; // Stores y-coordinates (array of arrays).

    // Process each shape (from index 0 to n) using the 'inline' function.
    for ( var i = 0 ; i <= n ; i++ )
    {
      inline(x , y , i , m , input);
    }

    /*
     * Compare each subsequent shape (from index 1) with the first shape (at index 0).
     * The goal is to find shapes identical to the first one after transformations.
     */
    for ( var i = 1 ; i <= n ; i++ )
    {
      // Only compare if the number of points is the same.
      if ( m[0] == m[i] )
      {
        var flag = true; // Assume shapes are identical initially.

        // Compare point by point.
        for ( var j = 1 ; j <= m[0] ; j++ )
        {
          // If any coordinate pair doesn't match, set flag to false and break.
          if ( x[0][j] != x[i][j] || y[0][j] != y[i][j] )
          {
            flag = false;
            break;
          }
        }

        // If 'flag' is still true, the shapes are identical (after initial normalization).
        if ( flag )
        {
          console.log(i); // Output the index of the matching shape.
        }
        else
        {
          /*
           * If not identical, try inverting the current shape (x[i], y[i])
           * and then re-compare. This checks for mirror images or shapes
           * traversed in reverse order.
           */
          inv(x[i] , y[i] , m[i]);

          // Reset flag for the new comparison.
          var flag = true;

          // Re-compare point by point after inversion.
          for ( var j = 1 ; j <= m[0] ; j++ )
          {
            if ( x[0][j] != x[i][j] || y[0][j] != y[i][j] )
            {
              flag = false;
              break;
            }
          }

          // If 'flag' is true after inversion, output the index.
          if ( flag )
          {
            console.log(i);
          }
        }
      }
    }

    // After processing all shapes in a set, print a separator.
    console.log("+++++");
  }
}

// Entry point: Read input from standard input and pass it to the Main function.
Main(require("fs").readFileSync("/dev/stdin" , "utf8"));

// End of file.
/* EOF */