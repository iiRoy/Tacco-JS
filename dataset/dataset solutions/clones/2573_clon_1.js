function     Main  (  input  )   {
  // The input string is first split into individual lines.
  // This operation prepares the data for subsequent processing.
  input = input . split ( "\n" ) ;

  /*
   * Initialize key variables from the parsed input array.
   * N: Represents the total number of items or a limit.
   * LineA, LineB, LineC: Arrays of numbers derived from specific input lines.
   */
  var   N    =   input   [0] ;
  var   LineA    =   input [1] . split ( " " ) . map ( Number ) ;
  var   LineB    =   input [2] . split ( " " ) . map ( Number ) ;
  var   LineC    =   input [3] . split ( " " ) . map ( Number ) ;

  // Define an anonymous function 'sum' that calculates the total of elements in an array.
  var   sum    =   function  (  Line  ) {
          var   sum   =   0 ; // A temporary variable to hold the running total.
          // Loop through each element of the provided 'Line' array.
          for   (  var   i  =  0 ;   i  <  Line . length ;   ++i  )   {
                  sum   +=   Line  [i] ; // Accumulate the value of the current element.
          } ;
          return   sum ; // Return the final calculated sum.
  } ;



  // Compute the initial value of 'Allsum' by summing all elements in 'LineB'.
  Allsum    =   sum ( LineB ) ;


  // Iterate through the 'LineA' array to apply conditional additions to 'Allsum'.
  // The loop runs from the first element up to (N-1)th element.
  for   (  var   j  =  0 ;   j  <  N  -  1  ;   j++  )   {
    // Check if the current element of LineA is exactly one less than the next element.
    if   (   LineA  [j]   ==   LineA  [j+1]  -  1   )   {
      // If the condition holds true, add the corresponding element from LineC to 'Allsum'.
      Allsum    =   Allsum   +   LineC  [j] ;
    }
  }

  // Print the final computed value of 'Allsum' to the standard output.
  console . log ( Allsum ) ;
}

// Invoke the Main function. The input is read synchronously from standard input ('/dev/stdin')
// as a UTF-8 encoded string.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;