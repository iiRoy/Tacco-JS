/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct, yet functionally identical, version.
 */
function Main(  s  )
{
  // Split the input string by newline characters to get an array of lines.
  s =  s.split ( "\n" ) ;

  /*
   * The first line contains 'n', which is processed here.
   * Note the unary plus operator for type conversion and subtraction.
   */
  var   n = +s [ 0 ] - 1 ;


  // The second line contains space-separated numbers; parse them into an array 'a'.
  var a = s [ 1 ] . split ( " " ) . map ( a => +a ) ;

  // Initialize an empty array 'b'. This array will store prefix sums.
  var b = [ ] ;

  /*
   * Calculate prefix sums and store them in array 'b'.
   * The 'reduce' method is used to iterate and accumulate values.
   * 'b[i-1]' stores the sum up to the previous element.
   * 'b[n]' will hold the total sum of elements in 'a'.
   */
  b [ n ] = a . reduce ( ( a , z , i ) => {
    b [ i - 1 ] = a ; // Store the current accumulated sum in b, adjusted for index.
    return a + z ;    // Return the new accumulated sum for the next iteration.
  } ) ;


  // Initialize 'ans' with a very large number to find the minimum later.
  var ans = 9e15 ;


  // Loop through possible split points for the array.
  for ( var i = 1 ; i < n - 1 ; i++ )
  {
    // Calculate target sums for the left (sl) and right (sr) partitions.
    // The '>>> 1' is a fast way to perform integer division by 2 (equivalent to Math.floor(x / 2)).
    var sl = ( b [ i ] + 1 ) >>> 1 , sr = ( b [ n ] + b [ i ] + 1 ) >>> 1 ;

    // Find the lower bound for 'sl' in the first part of 'b'.
    var l = lower_bound ( b , 0 , i - 1 , sl ) ;
    // Find the lower bound for 'sr' in the second part of 'b'.
    var r = lower_bound ( b , i + 1 , n - 1 , sr ) ;

    /*
     * Calculate the four partition sums based on 'l', 'i', and 'r'.
     * Then sort them to easily find the min and max values.
     * The differences represent the four segments created by the three cuts.
     */
    var m = [
      b [ l ] ,
      b [ i ] - b [ l ] ,
      b [ r ] - b [ i ] ,
      b [ n ] - b [ r ]
    ] . sort ( ( a , b ) => a - b ) ;

    // Update the minimum answer found so far.
    ans = Math.min ( ans , m [ 3 ] - m [ 0 ] ) ;

    // Check an alternative split if 'l' is not at the very beginning.
    if ( l )
    {
      // Recalculate partition sums with 'l-1' as a cut point.
      m = [
        b [ l - 1 ] ,
        b [ i ] - b [ l - 1 ] ,
        b [ r ] - b [ i ] ,
        b [ n ] - b [ r ]
      ] . sort ( ( a , b ) => a - b ) ;
      ans = Math.min ( ans , m [ 3 ] - m [ 0 ] ) ;

      // Further check if there's enough space to consider 'r-1' as well.
      if ( r - i > 1 )
      {
        // Recalculate with both 'l-1' and 'r-1' as cut points.
        m = [
          b [ l - 1 ] ,
          b [ i ] - b [ l - 1 ] ,
          b [ r - 1 ] - b [ i ] ,
          b [ n ] - b [ r - 1 ]
        ] . sort ( ( a , b ) => a - b ) ;
        ans = Math.min ( ans , m [ 3 ] - m [ 0 ] ) ;
      }
    }

    // Check another alternative split if 'r' is not immediately after 'i'.
    if ( r - i > 1 )
    {
      // Recalculate partition sums with 'r-1' as a cut point, keeping 'l' as is.
      m = [
        b [ l ] ,
        b [ i ] - b [ l ] ,
        b [ r - 1 ] - b [ i ] ,
        b [ n ] - b [ r - 1 ]
      ] . sort ( ( a , b ) => a - b ) ;
      ans = Math.min ( ans , m [ 3 ] - m [ 0 ] ) ;
    }
  }

  // Output the final minimum difference found.
  console . log ( ans ) ;
}


/*
 * Helper function: lower_bound.
 * Performs a binary search to find the first element in a sorted array 'd'
 * (from index 'a' to 'b') that is not less than 'e'.
 * If all elements are less than 'e', it returns 'b'.
 */
function lower_bound ( d , a , b , e ) {
  for ( var c ; 1 < b - a ; ) // Loop while the search range is greater than 1.
    d [ c = 0 | ( a + b ) / 2 ] < e ? a = c : b = c ; // Midpoint calculation and range adjustment.
  return d [ a ] < e ? b : a ; // Return the index of the lower bound.
} ;


// Read input from stdin, decode as UTF-8, and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;