/*
 * This JavaScript code reads input from standard input,
 * processes each line, and determines if two line segments
 * defined by points on that line have the same slope.
 *
 * Each line of input is expected to contain eight space-separated numbers
 * representing the coordinates of two points:
 * (x1, y1, x2, y2, x3, y3, x4, y4).
 *
 * The script then calculates the slope of the line segment from (x1, y1) to (x2, y2)
 * and the slope of the line segment from (x3, y3) to (x4, y4).
 * These slopes are compared after being formatted to 6 decimal places.
 * If they are equal, 'YES' is printed; otherwise, 'NO' is printed.
 */
require ( "fs" )
  /*
   * Read the entire content of the standard input file.
   * "/dev/stdin" is a common path for standard input on Unix-like systems.
   */
  . readFileSync (
    "/dev/stdin",  // Path to the standard input stream
    "utf8"         // Specify UTF-8 encoding for reading the file content
  )
  // Split the entire file content into an array of individual lines.
  . split ( '\n' )
  /*
   * The 'map' function iterates over each line in the array.
   * For every line, the provided anonymous function is executed.
   * The variable 'i' represents the current line string being processed.
   */
  . map (
    function ( i ) {
      // Split the current line 'i' by spaces to get an array of string components.
      // This array is assigned to the variable 'c'.
      c = i . split ( ' ' ) ;

      // Check if the third element (index 2) of the 'c' array exists and is truthy.
      // This is a minimal check to ensure enough data for the first slope calculation.
      if ( c [ 2 ] ) {

        // Print the result of the slope comparison to the console.
        console . log (
          (
            ( ( c [ 3 ] - c [ 1 ] ) / ( c [ 2 ] - c [ 0 ] ) ) // Calculate slope of first segment: (y2 - y1) / (x2 - x1)
            . toFixed ( 6 )                                   // Format the first slope to 6 decimal places for precise comparison
          )
          ==                                                  // Equality operator to compare the two formatted slopes
          (
            ( ( c [ 7 ] - c [ 5 ] ) / ( c [ 6 ] - c [ 4 ] ) ) // Calculate slope of second segment: (y4 - y3) / (x4 - x3)
            . toFixed ( 6 )                                   // Format the second slope to 6 decimal places
          )
          ? 'YES'                                             // If the two formatted slopes are strictly equal
          : 'NO'                                              // Otherwise, if the slopes are not equal
        )
      }
    }
  )