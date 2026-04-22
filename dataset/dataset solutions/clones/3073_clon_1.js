function    Main ( input ) {
  // This is the main function that processes the input string.

  /*
   * First, we'll parse the initial input.
   * The input string contains multiple lines.
   * We trim leading/trailing whitespace and split it into an array of lines.
   */
  var tmp = input.trim().split("\n") ;

  // The first line contains X, Y, Z, and K.
  // We split it by whitespace, then convert each part to a number.
  var XYZK = tmp[0] .split ( /\s/ ) .map ( val => Number ( val ) ) ;

  // Destructure the XYZK array into individual variables for clarity.
  var X = XYZK[0] ;  // Represents the size of array A
  var Y = XYZK[1] ;  // Represents the size of array B
  var Z = XYZK[2] ;  // Represents the size of array C
  var K = XYZK[3] ;  // Represents the number of top sums to consider

  // Parse the second line into array AAry.
  // Split by whitespace and convert elements to numbers.
  var AAry = tmp[1] .split ( /\s/ ) .map ( val => Number ( val ) ) ;

  // Parse the third line into array BAry.
  // Split by whitespace and convert elements to numbers.
  var BAry = tmp[2] .split ( /\s/ ) .map ( val => Number ( val ) ) ;

  // Parse the fourth line into array CAry.
  // Split by whitespace and convert elements to numbers.
  var CAry = tmp[3] .split ( /\s/ ) .map ( val => Number ( val ) ) ;


  // Sort all three arrays in descending order.
  // This is crucial for efficiently finding the largest sums.
  AAry .sort ( ( a , b ) => b - a ) ;
  BAry .sort ( ( a , b ) => b - a ) ;
  CAry .sort ( ( a , b ) => b - a ) ;


  // Initialize an array to store sums of elements from AAry and BAry.
  var ABSumAry = [ ] ;

  // Initialize an array to store sums of elements from ABSumAry and CAry.
  var ABCSumAry = [ ] ;


  // Calculate all possible sums of elements from AAry and BAry.
  // We iterate through AAry up to X elements.
  for ( var i = 0 ; i < X ; i ++ )
  {
    // For each element in AAry, iterate through BAry up to Y elements.
    for ( var j = 0 ; j < Y ; j ++ )
    {
      // Add the sum of the current elements to ABSumAry.
      ABSumAry .push ( AAry[i] + BAry[j] ) ;
    }
  }

  // Sort the ABSumAry in descending order to easily pick the largest sums.
  ABSumAry .sort ( ( a , b ) => b - a ) ;


  // Now, calculate the sums involving CAry.
  // We only need to consider up to K largest sums from ABSumAry,
  // or fewer if ABSumAry has less than K elements.
  for ( var k = 0 ; k < Math .min ( K , ABSumAry .length ) ; k ++ )
  {
    // For each selected sum from ABSumAry, iterate through CAry up to Z elements.
    for ( var l = 0 ; l < Z ; l ++ )
    {
      /*
       * This condition appears to be a potential optimization or early exit,
       * though its exact behavior might need careful re-evaluation in context.
       * For Type I clone, it must remain unchanged.
       */
      if ( Math .min ( K , ABSumAry .length ) < k * l )
      {
        continue ; // Skip to the next iteration if condition met.
      }

      // Add the sum of the current ABSumAry element and CAry element to ABCSumAry.
      ABCSumAry .push ( ABSumAry[k] + CAry[l] ) ;
    }
  }

  // Sort the final sums array in descending order.
  ABCSumAry .sort ( ( a , b ) => b - a ) ;


  // Print the K largest sums from ABCSumAry.
  for ( var m = 0 ; m < K ; m ++ )
  {
    // Output each sum to the console.
    console .log ( ABCSumAry[m] ) ;
  }
} // End of Main function.


// Call the Main function with input read from standard input.
// This reads the entire file content as a string.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;