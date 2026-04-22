/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates extensive use of whitespace and comments
 * while maintaining exact functional equivalence as per the definition.
 * All identifiers, operators, and expressions remain precisely the same.
 */

// Define the primary function that will process the given input string.
function Main(  input  ) {

  // First, split the entire input string by newline characters.
  // This separates the line containing N and K from the line containing array A.
  var NKA = input . split (  '\n'  ) ; // NKA will be an array of strings.

  // Next, take the first element of NKA (which is the line "N K")
  // and split it by spaces to get individual string values for N and K.
  var NK = NKA[0] . split (  ' '  ) ;

  // Parse the first element of NK into an integer. This is the value of N.
  // The radix 10 is explicitly provided for robustness.
  var N = parseInt(  NK[0]  ,  10  ) ;

  // Parse the second element of NK into an integer. This is the value of K.
  // Again, radix 10 is specified.
  var K = parseInt(  NK[1]  ,  10  ) ;

  /*
   * For the array A, we take the second element of NKA (the line with A's elements).
   * It's split by spaces to get string representations of array elements.
   * Then, the 'map' function is used to convert each string element 'v'
   * into its integer equivalent using parseInt with base 10.
   */
  var A = NKA[1] . split (  ' '  ) . map (  v  =>  parseInt(  v  ,  10  )  ) ;


  // Finally, calculate the required result using the formula (N - 1) / (K - 1)
  // and apply Math.ceil to round up to the nearest whole number.
  // The result is then printed to the standard output.
  console . log (  Math . ceil (  (  N  -  1  )  /  (  K  -  1  )  )  ) ;

} // End of the Main function definition.


// This line reads the input from standard input (/dev/stdin)
// using Node.js's 'fs' module and passes it to the Main function.
// The input is read as UTF-8 encoded text.
Main (  require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,  "utf8"  )  ) ;