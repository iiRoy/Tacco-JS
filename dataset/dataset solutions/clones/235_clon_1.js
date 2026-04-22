/*
 * This JavaScript code processes input lines from stdin.
 * It reads the file, trims whitespace, splits it into lines,
 * and then iterates over each line to perform a specific calculation.
 */
require ( "fs" )
  // Synchronously reads the entire content of the specified file.
  // In this case, it's reading from standard input.
  . readFileSync ( "/dev/stdin" , "utf8" )
  /*
   * The .trim() method removes whitespace from both ends of a string.
   * This ensures that any accidental leading or trailing blank lines
   * or spaces in the overall input do not affect processing.
   */
  . trim ( )
  // Splits the input string into an array of substrings using the newline character
  // as the delimiter. Each element in the resulting array represents one line of input.
  . split ( '\n' )
  /*
   * The .map() method creates a new array populated with the results of
   * calling a provided function on every element in the calling array.
   * Here, for each line 'i', it performs a calculation and prints a result.
   */
  . map ( function ( i ) {
            // Splits the current line 'i' by spaces. The components are stored in array 'c'.
            // The comma operator allows for multiple expressions in contexts where one is expected.
            c = i . split ( ' ' ) ,
            // Logs 'YES' or 'NO' to the console based on a geometric calculation.
            // This calculation likely checks if two line segments are parallel or if points are collinear.
            console . log (
              /*
               * Math.abs() returns the absolute value of a number.
               * The calculation (c[2]-c[0])*(c[6]-c[4])+(c[3]-c[1])*(c[7]-c[5])
               * is a form of 2D cross product, often used to determine orientation or area.
               * If this value is extremely close to zero (within 1e-10 epsilon),
               * it suggests a specific geometric condition (e.g., collinearity or parallelism).
               */
              Math . abs (
                ( c [ 2 ] - c [ 0 ] ) * ( c [ 6 ] - c [ 4 ] ) +
                ( c [ 3 ] - c [ 1 ] ) * ( c [ 7 ] - c [ 5 ] )
              )
              // Compares the absolute result with a small floating-point epsilon.
              // This is a common practice to account for floating-point inaccuracies.
              <
              1e-10
                // If the condition is true (value is very close to zero), output 'NO'.
                ? 'NO'
                // Otherwise (value is not close to zero), output 'YES'.
                : 'YES'
            )
          } )
// The script finishes after processing all lines.