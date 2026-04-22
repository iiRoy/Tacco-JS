/*
 * This file contains the primary logic for solving a specific problem.
 * The Main function orchestrates the entire process.
 */
function Main( input )
{
  // Helper function for numeric comparison, used in sorting arrays.
  function compareFunc( a, b )
  {
    /*
     * This function calculates the difference between two numbers,
     * which is a standard way to implement a numeric sort in ascending order.
     * If a < b, result is negative. If a > b, result is positive. If a == b, result is zero.
     */
    return a - b ;
  }

  // Process the raw input string.
  // First, trim any leading/trailing whitespace.
  // Then, split by newline characters to get individual lines.
  // Finally, map each line to an array of strings, splitting by space.
  input = input . trim( ) . split( "\n" ) . map( function( x ) { return x . split( " " ) } ) ;


  // Parse the first line of input to extract problem parameters.
  // All elements are converted to integers with base 10.
  var L1 = input[ 0 ] . map( e => parseInt( e , 10 ) ) ;

  /*
   * Initialize key problem parameters.
   * A and B represent quantities of two types of items, scaled by 100.
   * C and D represent quantities of two other types of items.
   * E is a percentage value.
   * F is the total capacity or budget.
   */
  var A = L1[ 0 ] * 100 ; // Scaled A
  var B = L1[ 1 ] * 100 ; // Scaled B
  var C = L1[ 2 ] ;       // Item C quantity
  var D = L1[ 3 ] ;       // Item D quantity
  var E = L1[ 4 ] ;       // Percentage E
  var F = L1[ 5 ] ;       // Total capacity F

  // This array will store all possible combinations of A and B items
  // that do not exceed the total capacity F.
  var ABList = [ ] ;

  // Temporary variable used in loops.
  var tmp ;

  // Loop to generate combinations of A and B.
  // The outer loop iterates through possible multiples of A.
  for ( var i = 0 ; i < ( F / A ) ; i++ )
  {
    // Calculate the current total for 'A' items.
    tmp = A * i ;

    // The inner loop iterates through possible multiples of B,
    // ensuring the total (tmp + B*j) does not exceed F.
    for ( var j = 0 ; j < ( ( F - tmp ) / B ) ; j++ )
    {
      // Add the current combination total to ABList.
      ABList . push( tmp + B * j ) ;
    }
  }

  // Sort the ABList in ascending order using the custom comparison function.
  ABList . sort( compareFunc ) ;

  // Filter out duplicate values from ABList to ensure uniqueness.
  ABList = ABList . filter( function ( x, i, self )
  {
    // Keep only the first occurrence of each value.
    return self . indexOf( x ) === i ;
  } ) ;


  // Calculate the maximum possible "solute" amount.
  // This is derived from F (total capacity) and E (percentage).
  var x = Math . floor( F * E / ( 100 + E ) ) ;


  // This array will store all possible combinations of C and D items
  // that do not exceed the calculated maximum solute 'x'.
  var CDList = [ ] ;

  // Loop to generate combinations of C and D.
  // The outer loop iterates through possible multiples of C.
  for ( var i = 0 ; i < ( x / C ) ; i++ )
  {
    // Calculate the current total for 'C' items.
    tmp = C * i ;

    // The inner loop iterates through possible multiples of D,
    // ensuring the total (tmp + D*j) does not exceed 'x'.
    for ( var j = 0 ; j < ( ( x - tmp ) / D ) ; j++ )
    {
      // Add the current combination total to CDList.
      CDList . push( tmp + D * j ) ;
    }
  }

  // Sort the CDList in ascending order.
  CDList . sort( compareFunc ) ;

  // Filter out duplicate values from CDList.
  CDList = CDList . filter( function ( x, i, self )
  {
    return self . indexOf( x ) === i ;
  } ) ;


  // Create a bitmap (boolean array) for quick lookup of CDList values.
  // Initialize all elements to 0 (false).
  var CDbitmap = [ ] ;
  for ( var i = 0 ; i <= x ; i++ )
  {
    CDbitmap . push( 0 ) ;
  }

  // Mark the presence of each value from CDList in the bitmap.
  for ( var i of CDList )
  {
    CDbitmap[ i ] = 1 ;
  }


  // Declare variables for the main calculation loop.
  var tmpDens, tmpCDLL, tmpCDHL ; // Temporary density, lower limit for CD, higher limit for CD
  tmpDens = 0 ; // Initialize maximum density found so far to 0.

  // 'ans' will store the best combination (total amount, solute amount).
  ans = [ 0, 0 ] ;

  // Initialize tmpCDHL to x, representing the highest possible solute amount.
  tmpCDHL = x ;

  // Iterate through each possible combination of A and B items (water amount).
  for ( var i of ABList )
  {
    // Calculate the lower bound for the solute (CD) amount.
    // This is based on the current maximum density found.
    tmpCDLL = Math . round( i * tmpDens ) ;

    // Calculate the upper bound for the solute (CD) amount.
    // It must satisfy two conditions:
    // 1. Solute amount should not exceed the percentage E of water (i).
    // 2. Total amount (water + solute) should not exceed F.
    tmpCDHL = Math . min( Math . floor( i * E / 100 ) , F - i ) ;


    // Iterate through possible solute amounts (j) within the calculated bounds.
    for ( var j = tmpCDLL ; j <= tmpCDHL ; j++ )
    {
      // Check if this solute amount 'j' is a valid combination from CDList
      // using the pre-computed bitmap.
      if ( CDbitmap[ j ] === 1 )
      {
        // If the current density (j / i) is greater than the best density found so far,
        // update the answer.
        if ( ( j / i ) > tmpDens )
        {
          ans[ 0 ] = i + j ; // Update total amount (water + solute).
          ans[ 1 ] = j ;     // Update solute amount.
          tmpDens = j / i ;  // Update the maximum density.
        }
        // Optimization: Mark this 'j' as processed to avoid redundant checks
        // if multiple 'i' values could potentially combine with it.
        CDbitmap[ j ] = 0 ;
      }
    }
  }

  // Output the final answer, rounding the total amount and solute amount.
  console . log( "%d %d" , Math . round( ans[ 0 ] ) , Math . round( ans[ 1 ] ) ) ;
}

// Entry point: Read input from stdin and pass it to the Main function.
// This is a common pattern for competitive programming in Node.js.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;