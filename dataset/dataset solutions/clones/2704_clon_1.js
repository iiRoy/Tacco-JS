/*
 * This JavaScript function processes input data to calculate a specific output.
 * It's designed to be executed in an environment where 'require' and 'fs' modules are available.
 */
function Main( input ) {

  // Parse the first line of input to get N.
  // N is expected to be an integer.
  var N = parseInt( input.split( "\n" )[ 0 ] ) ;

  /*
   * The second line contains space-separated values for Alist.
   * These values will be parsed into integers later.
   */
  var Alist = input.split( "\n" )[ 1 ].split( " " ) ;


  // The third line contains space-separated values for Blist.
  // These values will also be parsed into integers.
  var Blist = input.split( "\n" )[ 2 ].split( " " ) ;

  // Loop through Alist to parse its elements into integers.
  // Also, parse Blist elements if they exist within the same index range.
  for ( var i = 0 ; i < Alist.length ; i ++ ) {
    Alist[ i ] = parseInt( Alist[ i ] ) ;
    if ( i < Blist.length ) {
       Blist[ i ] = parseInt( Blist[ i ] ) ;
    }
  }


  // Initialize the output variable, which will store the cumulative result.
  var output = 0 ;


  // Iterate through Blist to perform calculations based on Alist and Blist elements.
  for ( var i = 0 ; i < Blist.length ; i ++ ) {
    // Get current elements from Alist and Blist for the calculation.
    var tmpA1 = Alist[ i ] ;
    var tmpA2 = Alist[ i + 1 ] ;
    var tmpB = Blist[ i ] ;

    // Debugging information - original comment was: //console.log("tmpA1:" + tmpA1 + ",tmpA2:" + tmpA2 + ":tmpB:" + tmpB);
    // This line is commented out but kept for reference of the original intent.
    /*  console.log( "--- Current Iteration ---" +
                 " A1: " + tmpA1 +
                 ", A2: " + tmpA2 +
                 ", B: " + tmpB ) ;
    */

    // Case 1: If tmpB is less than or equal to tmpA1.
    if ( tmpB <= tmpA1 ) {
       output += tmpB ;
       continue ;
    }
    // Case 2: If tmpB is greater than tmpA1 but less than tmpA2.
    else if ( tmpB > tmpA1 && tmpB < tmpA2 ) {
      output += tmpB ;
      Alist[ i + 1 ] = tmpA2 - ( tmpB - tmpA1 ) ;
      continue ;
    }
    // Case 3: If tmpB is greater than both tmpA1 and tmpA2, but less than their sum.
    else if ( tmpB > tmpA1 && tmpB > tmpA2 && tmpB < tmpA1 + tmpA2 ) {
      output += tmpB ;
      Alist[ i + 1 ] = tmpA2 - ( tmpB - tmpA1 ) ;
      continue ;
    }
    // Case 4: If tmpB is greater than or equal to the sum of tmpA1 and tmpA2.
    else if ( tmpB >= tmpA1 + tmpA2 ) {
      output += tmpA1 + tmpA2 ;
      Alist[ i + 1 ] = 0 ;
      continue ;
    }
  }

  // Print the final calculated output to the console.
  console.log( output ) ;
}


// This line reads input from standard input and passes it to the Main function.
// It's a common pattern for competitive programming in Node.js.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;