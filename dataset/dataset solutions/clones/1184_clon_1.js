/*
 * This JavaScript file processes numerical input from stdin
 * to calculate and output various distance metrics.
 * The configuration below sets up the input source and line ending.
 */
// config = { stdin: 'tmp', newline: '\r\n' }; // Example for Windows environment (currently commented out)
config = { stdin: '/dev/stdin', newline: '\n' } ; // Standard configuration for Linux/Unix systems

// Read the entire input file, convert it to ASCII,
// then split it into lines based on the configured newline character.
// It processes the first three lines and parses numbers from them.
line = require ( 'fs' ) // Import the Node.js 'fs' (file system) module.
         . readFileSync ( config . stdin , 'ascii' ) // Read the file synchronously from the specified stdin path.
         . split ( config . newline , 3 )             // Split the content into an array of strings, at most 3 lines.
         . map ( function ( line )                     // For each line string in the array:
           {
             return line . split ( ' ' ) . map ( Number ) ; // Split the line by spaces, then convert each part to a number.
           }
         ) ;

/*
 * This immediately invoked function expression (IIFE) calculates
 * the element-wise absolute differences between two arrays.
 * It takes the second and third processed lines from the input as arguments.
 */
dist = ( function ( x , y )
  {
    var res = [ ] ; // Declare and initialize an empty array to store the results.

    // Iterate over the indices of the first array (x).
    for ( var i in x ) res . push ( Math . abs ( x [ i ] - y [ i ] ) ) ; // Calculate |x[i] - y[i]| and add to 'res'.

    return res ; // Return the array containing all calculated absolute differences.
  }
) ( line [ 1 ] , line [ 2 ] ) ; // Execute the function with line[1] and line[2] as 'x' and 'y'.

// --- Output Calculations ---

// Calculate and print the L1 norm (Manhattan distance), which is the sum of absolute differences.
console . log (
  dist . reduce ( function ( prev , cur ) {
    return prev + cur ; // Accumulate the sum.
  } , 0 ) // Initial value for the sum is 0.
) ;

// Calculate and print the L2 norm (Euclidean distance).
console . log (
  Math . sqrt ( // Take the square root of the final sum.
    dist . reduce ( function ( prev , cur ) {
      return prev + cur * cur ; // Accumulate the sum of squares.
    } , 0 ) // Initial value for the sum of squares is 0.
  )
) ;

// Calculate and print the L3 norm (Minkowski distance with p=3).
console . log (
  Math . pow ( // Raise the sum to the power of 1/3.
    dist . reduce ( function ( prev , cur ) {
      return prev + cur * cur * cur ; // Accumulate the sum of cubes.
    } , 0 ) , // Initial value for the sum of cubes is 0.
    1 / 3 // The exponent for the cube root.
  )
) ;

// Calculate and print the L-infinity norm (Chebyshev distance), which is the maximum absolute difference.
console . log (
  dist . reduce ( function ( prev , cur ) {
    return Math . max ( prev , cur ) ; // Find the maximum value.
  } , 0 ) // Initial value for comparison is 0.
) ;