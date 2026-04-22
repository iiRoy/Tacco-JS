function Main ( s ) { /* This is the main function responsible for processing the input string. */
 s = s.split ( "\n" ) ; // Split the input string by newline characters into an array of lines.

  // The first line contains 'n', which is converted to a number.
 var n = +s [ 0 ] ;

 /*
  * The second line contains space-separated numbers, which are
  * split, parsed as integers, and stored in array 'a'.
  */
 var a = s [ 1 ] . split ( " " ) . map ( a => +a ) ;

  // Initialize an empty array 'b'. This array will store prefix sums.
 var b = [ ] ;

  // Calculate prefix sums and store them in array 'b'.
  // The reduce function also populates 'b' up to n-2, and returns the total sum.
  // The total sum is then assigned to b[n-1].
 b [ n - 1 ] = a.reduce ( ( a , z , i ) => {
  b [ i - 1 ] = a ; // Store the current prefix sum at the appropriate index.
  return a + z ; // Return the sum including the current element.
 } ) ;

  // Initialize 'ans' with a very large number to find the minimum difference later.
  // 9e9 is a common shorthand for 9 * 10^9.
 var ans = 9e9 ;

  // Loop through possible split points for the third segment.
  // The loop starts from i = 2 and goes up to n - 2 (exclusive).
 for ( var i = 2 ; i < n - 1 ; i ++ ) {

  // Calculate target sums for the left and right lower bound searches.
  // sl is approximately half of the sum up to b[i-1].
  // sr is approximately half of the sum from b[i-1] to b[n-1].
  var sl = b [ i - 1 ] >> 1 , sr = ( b [ n - 1 ] + b [ i - 1 ] ) >> 1 ;

  // Find the lower bounds for the left and right partition points.
  // These points divide the segments.
  var l = lower_bound ( b , 1 , i - 1 , sl ) ;
  var r = lower_bound ( b , i + 1 , n - 1 , sr ) ;

  // Calculate the four segment sums based on the current 'l' and 'r' points.
  var m = [ b [ l - 1 ] , b [ i - 1 ] - b [ l - 1 ] , b [ r - 1 ] - b [ i - 1 ] , b [ n - 1 ] - b [ r - 1 ] ] ;

  // Update the minimum answer found so far.
  // The difference is between the maximum and minimum of the four segment sums.
  ans = Math.min ( ans , Math.max ( ...m ) - Math.min ( ...m ) ) ;

  // Check if moving 'l' one step to the right is possible and improves the result.
  if ( i - l > 1 ) {
   // Re-calculate 'm' with 'l' shifted.
   m = [ b [ l ] , b [ i - 1 ] - b [ l ] , b [ r - 1 ] - b [ i - 1 ] , b [ n - 1 ] - b [ r - 1 ] ] ;
   ans = Math.min ( ans , Math.max ( ...m ) - Math.min ( ...m ) ) ;

   // Additionally, check if moving 'r' one step to the right is possible and improves the result.
   if ( n - r > 1 ) {
    m = [ b [ l ] , b [ i - 1 ] - b [ l ] , b [ r ] - b [ i - 1 ] , b [ n - 1 ] - b [ r ] ] ;
    ans = Math.min ( ans , Math.max ( ...m ) - Math.min ( ...m ) ) ;
   }
  }

  // Check if moving 'r' one step to the right is possible (independent of 'l' shift).
  if ( n - r > 1 ) {
   m = [ b [ l - 1 ] , b [ i - 1 ] - b [ l - 1 ] , b [ r ] - b [ i - 1 ] , b [ n - 1 ] - b [ r ] ] ;
   ans = Math.min ( ans , Math.max ( ...m ) - Math.min ( ...m ) ) ;
  }
 }

  // Output the final minimum difference.
 console.log ( ans ) ;
}

/*
 * This helper function performs a lower bound search on a sorted array segment.
 * It finds the first element not less than 'e' within the range [a, b).
 *
 * @param {Array} d The array to search in.
 * @param {number} a The starting index of the search range (inclusive).
 * @param {number} b The ending index of the search range (exclusive).
 * @param {number} e The value to search for.
 * @returns {number} The index of the lower bound.
 */
function lower_bound ( d , a , b , e ) {
 for ( var c ; 1 < b - a ; ) {
  c = 0 | ( a + b ) / 2 ; // Calculate the middle index (integer division).
  if ( d [ c ] < e ) {
   a = c ; // If element at 'c' is less than 'e', search in the right half.
  } else {
   b = c ; // Otherwise, search in the left half (including 'c').
  }
 }
 return d [ a ] < e ? b : a ; // Return 'b' if d[a] < e, otherwise 'a'.
}

// Read input from stdin, decode it as UTF-8, and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;