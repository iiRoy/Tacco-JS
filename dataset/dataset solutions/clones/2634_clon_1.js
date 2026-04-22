function Main ( input ) {
  /* This is the main function responsible for processing the input data.
   * It takes a string 'input' which contains multiple lines of data. */

  // The first line of input represents the number of elements, N.
  var N = new Number ( input . split ( '\n' ) [ 0 ] ) ;
  // The second line contains space-separated values, which are parsed into an array 'v'.
  var v = input . split ( '\n' ) [ 1 ] . split ( ' ' ) ;

  // Convert all string elements in array 'v' to numbers by subtracting zero.
  v = v . map ( x => x - 0 ) ;

  // Sort the array 'v' in ascending order. This is crucial for the algorithm.
  v . sort ( ) ;

  // Declare a temporary variable to store intermediate calculation results.
  var tmp ;
  // Loop as long as there is more than one element remaining in the array 'v'.
  while ( v . length > 1 ) {
    /* Inside the loop, we perform the core operation:
     * 1. Take the smallest two elements.
     * 2. Calculate their average.
     * 3. Add the average back to the array. */

    // Remove and get the first (smallest) element, converting it to a float.
    var a = v . shift ( ) - 0.0 ;
    // Remove and get the new first (second smallest) element, converting to a float.
    var b = v . shift ( ) - 0.0 ;
        
    // Calculate the average of 'a' and 'b'.
    tmp = ( ( a + b ) / 2.0 ) ;
    // Add the calculated average back to the beginning of the array.
    v . unshift ( tmp ) ;
  } // End of while loop processing elements.

  // After the loop, only one element remains in 'v', which is the final result.
  // Print the final result to the console, ensuring it's a number (float).
  console . log ( v - 0.0 ) ;
}
// This line reads the input from standard input and passes it to the Main function.
// It uses Node.js's 'fs' module to read the file specified by "/dev/stdin".
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;