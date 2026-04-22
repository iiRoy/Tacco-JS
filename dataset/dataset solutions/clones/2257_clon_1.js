/*
 * This is the main entry point for the program.
 * It processes the input data to calculate a specific value.
 */
function  Main ( input )  {

  // Define a constant for the modulo operation.
  var  modnumber  =  1000000007;

  /*
   * First, parse the input string into a structured array of integers.
   * This involves two steps:
   * 1. Splitting the input string by newlines and spaces.
   * 2. Converting all resulting string parts into integers.
   */
  var  tmp  =  parseint_array ( inputting ( input ) ) ;


  /* Extract 'n' and 'k' values from the first line of input. */
  var  n  =  tmp [ 0 ] [ 0 ] ;
  var  k  =  tmp [ 0 ] [ 1 ] ;

  /*
   * Sort the second part of the temporary array in descending order.
   * This is crucial for the subsequent calculations.
   */
  tmp [ 1 ] . sort ( function ( a ,  b )  {
    return  b - a ; /* Sorts elements from largest to smallest. (降順に並べ替える) */
  } ) ;


  // Initialize an object to hold maximum and minimum calculated values.
  var  val  =  { max : 0 ,  min : 0 } ;

  /*
   * Calculate the 'max' component.
   * The loop iterates through the sorted array to accumulate values.
   */
  for ( var  i  =  0 ;  i  <=  tmp [ 1 ] . length - k ;  i ++ )  {
    val . max  +=  tmp [ 1 ] [ i ]  *  ccc ( n - i - 1 ,  k - 1 ) ;
  }

  /*
   * Calculate the 'min' component.
   * This loop also iterates through the sorted array, but with a different starting point.
   */
  for ( var  i  =  k - 1 ;  i  <  tmp [ 1 ] . length ;  i ++ )  {
    val . min  +=  tmp [ 1 ] [ i ]  *  ccc ( i ,  k - 1 ) ;
  }


  /*
   * Finally, output the result to the console.
   * The result is the difference between 'max' and 'min', modulo 'modnumber'.
   * This is the standard output for the program.
   */
  console . log ( ( val . max - val . min )  %  modnumber ) ;
}


/*
 * Function to calculate combinations (n C k) in a specific way.
 * It prints intermediate steps to the console for debugging purposes.
 */
function  ccc ( n ,  k )  {

  console . log ( n  +  ","  +  k ) ; // Log the input parameters for the combination calculation.

  var  f  =  1 ; // Initialize numerator product.
  var  g  =  1 ; // Initialize denominator product.

  /*
   * Loop to calculate factorial-like products for the combination.
   * 'f' accumulates (n * (n-1) * ... * (n-k+1))
   * 'g' accumulates (k * (k-1) * ... * 1)
   */
  for ( var  i  =  0 ;  i  <  k ;  i ++ )  {
    f  *=  n - i ;
    g  *=  i + 1 ;
  }

  console . log ( f  +  "/"  +  g  +  "="  +  ( f / g ) ) ; // Log the calculation result.

  return  f / g ; // Return the calculated combination value.
}


/*
 * Helper function to preprocess the raw input string.
 * It converts the single input string into a 2D array of strings.
 * Each inner array represents a line, with elements separated by spaces.
 * This is how standard input is typically structured.
 */
function  inputting ( input )  {

  // Split the entire input string by newline characters.
  input  =  input . split ( "\n" ) ;

  var  tmp  =  [ ] ; // Initialize an empty array to store the processed lines.

  /*
   * Iterate over each line and split it by spaces.
   * Store the resulting array of strings in the 'tmp' array.
   */
  for ( var  i  =  0 ;  i  <  input . length ;  i ++ )  {
    tmp [ i ]  =  input [ i ] . split ( " " ) ;
  }

  return  tmp ; // Return the 2D array of string tokens.
}

/*
 * Helper function to convert a 2D array of strings into a 2D array of integers.
 * This is typically used after the 'inputting' function to prepare numerical data.
 */
function  parseint_array ( arr )  {

  var  ret  =  [ ] ; // Initialize an empty array to hold the integer arrays.

  /*
   * Outer loop: iterates through each inner array (line) in the input 'arr'.
   */
  for ( var  i  =  0 ;  i  <  arr . length ;  i ++ )  {
    ret [ i ]  =  [ ] ; // Initialize an empty inner array for the current line.

    /*
     * Inner loop: iterates through each string element in the current inner array.
     * Converts each string to an integer using parseInt().
     */
    for ( var  j  =  0 ;  j  <  arr [ i ] . length ;  j ++ )  {
      ret [ i ] [ j ]  =  parseInt ( arr [ i ] [ j ] ) ;
    }
  }

  return  ret ; // Return the 2D array of integers.
}



/*
 * This section handles the actual execution of the Main function
 * by reading input from standard input (/dev/stdin).
 * It should not be modified as it's part of the standard execution environment.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;

// The following lines are commented out examples of Main function calls,
// useful for local testing or debugging purposes.
// Main("6 3\n10 10 10 -10 -10 -10")
// Main("10 6\n1000000000 1000000000 1000000000 1000000000 1000000000 0 0 0 0 0")