"use strict"
; /* This line enforces strict mode for better error handling. */

/**
 * Custom Input Reader Class.
 *
 * @param {string} s - The input string, typically the entire file content.
 * @param {Function} f - The parsing function (e.g., Number, String), defaults to Number.
 */
function I ( s , f )
{
  this._s = s . split ( "\n" ) ; /* Stores input lines as an array. */
  this._c = 0 ; /* Column counter for current line. */
  this._l = 0 ; /* Line counter for current line. */
  this._f = f || Number ; /* Parsing function, defaults to Number. */
}

/*
 * Prototype method 'a' to read the next token.
 * Reads one token, increments column, moves to next line if current line is exhausted.
 */
I . prototype . a = function ( )
{
  var l = this._s[this._l] ; // Get the current line.
  
  if ( ! l )
  {
    return ; // Return if no more lines.
  }
  
  var t = l . trim ( ) . split ( " " ) ; // Trim whitespace and split by space.
  var a = t [ this._c ] ; // Get the token at the current column.
  
  this._c ++ ; // Increment the column counter.
  
  // If all tokens on the current line have been read:
  if ( t . length === this._c )
  {
    this._c = 0 ; // Reset column counter.
    this._l ++ ; // Move to the next line.
  }
  
  return this._f ( a ) ; // Parse and return the token.
} ;

/*
 * Prototype method 'l' to read all tokens on the current line.
 * Resets column counter, moves to next line, and returns parsed tokens.
 */
I . prototype . l = function ( )
{
  var l = this._s [ this._l ] ; // Get the current line.
  
  if ( ! l )
  {
    return ; // Return if no more lines.
  }
  
  this._c = 0 ; // Reset column counter for the new line.
  this._l ++ ; // Move to the next line.
  
  // Split the line, map each token using the parsing function, and return the array.
  return l . split ( " " ) . map ( this._f ) ;
} ;

/*
 * This is a commented-out utility function.
 * function build2DArray(rows, cols, defaultValue) {
 *   for (var fillValue = defaultValue || 0, arr = [], rowIdx = 0; rowIdx < rows; rowIdx++) {
 *     for (var innerArr = [], colIdx = 0; colIdx < cols; colIdx++) {
 *       innerArr.push(fillValue);
 *     }
 *     arr.push(innerArr);
 *   }
 *   return arr;
 * }
 */

const mod = 998244353 ; // Define the modulo constant.

/**
 * Main function to solve the problem.
 * @param {string} input - The raw input string.
 */
function main ( input )
{
  // Initialize input reader.
  var o = new I ( input ) ;
  
  // Read the number of elements.
  var n = o . a ( ) ;
  
  // Read 'n' elements into an array 'a'.
  var a = [ ] ;
  for ( var i = 0 ; i < n ; i ++ )
  {
    a . push ( o . a ( ) ) ;
  }
  
  // Calculate the sum of elements in array 'a'.
  var sum = a . reduce ( ( acc , cur ) => acc + cur , 0 ) ;
  
  // Calculate total possibilities (3^n).
  var total = 1 ;
  for ( var i = 0 ; i < n ; i ++ )
  {
    total = ( total * 3 ) % mod ;
  }
  
  // Calculate `ans1`: number of ways where the sum of chosen elements (R) is >= S/2.
  var ans1 = 0 ; // Initialize ans1. This represents the count for R >= S/2.

  // Initialize DP array for `ans1`. dp1[j] stores count of ways to get sum 'j'.
  var dp1 = [ 1 ] ; // Base case: one way to get sum 0 (by choosing no elements).
  
  // Iterate through each element in 'a' to build up dp1.
  for ( var i = 1 ; i <= n ; i ++ )
  {
    // Create a new DP array for the current iteration.
    // Its size should be enough to hold sums up to current_sum + a[i-1].
    // Note: The original code uses dp1.length + a[i-1], which is effectively dynamic sizing
    // based on the *current maximum sum* in dp1 plus the new element.
    // A safer upper bound would be sum+1.
    var dp2 = Array ( dp1.length + a[i - 1] ).fill(0) ;
    
    // Iterate through previous DP states.
    for ( var j = 0 ; j < dp1 . length ; j ++ )
    {
      // Case 1: Don't pick the current element a[i-1] for the sum.
      // It can either be assigned to the 'other' group or ignored (3rd option).
      // This means the count for sum 'j' doubles.
      dp2 [ j ] = ( dp2 [ j ] + dp1 [ j ] * 2 ) % mod ;
      
      // Case 2: Pick the current element a[i-1] for the sum.
      var next = j + a [ i - 1 ] ; // New sum if current element is picked.
      
      // Only consider if the new sum does not exceed the total sum.
      if ( next <= sum )
      {
        dp2 [ next ] = ( dp2 [ next ] + dp1 [ j ] ) % mod ;
      }
    }
    
    dp1 = dp2 ; // Update dp1 for the next iteration.
  }

  // Sum up all dp1 states where the sum 'j' is >= S/2.
  for ( var j = Math . ceil ( sum / 2 ) ; j <= sum ; j ++ )
  {
    if (j < dp1.length) { // Ensure index is within bounds of the dp1 array
        ans1 = (ans1 + dp1[j]) % mod ;
    }
  }
 
  // Calculate `ans2`: number of ways where the sum of chosen elements (R) is exactly S/2.
  var ans2 = 0 ; // Initialize ans2.
  
  // This calculation is only relevant if the total sum is even.
  if ( sum % 2 === 0 )
  {
    // Initialize DP array for `ans2`. dp3[j] stores count of ways to get sum 'j'.
    var dp3 = [ ] ;
    dp3[0] = 1 ; // Base case: one way to get sum 0.
    
    // Iterate through each element in 'a' to build up dp3.
    for ( var i = 1 ; i <= n ; i ++ )
    {
      // Create a new DP array for the current iteration.
      // Its size should be enough to hold sums up to current_sum + a[i-1].
      var dp4 = Array ( dp3 . length + a [ i - 1 ] ).fill(0) ;
      
      // Iterate through previous DP states.
      for ( var j = 0 ; j < dp3 . length ; j ++ )
      {
        // Case 1: Don't pick the current element a[i-1] for the sum.
        dp4 [ j ] = ( dp4 [ j ] + dp3 [ j ] ) % mod ;
        
        // Case 2: Pick the current element a[i-1] for the sum.
        var next = j + a [ i - 1 ] ; // New sum if current element is picked.
        
        // Only consider if the new sum does not exceed the total sum.
        if ( next <= sum )
        {
          dp4 [ next ] = ( dp4 [ next ] + dp3 [ j ] ) % mod ;
        }
      }
      
      dp3 = dp4 ; // Update dp3 for the next iteration.
    }
   
    // The value for ans2 is the count of ways to get exactly sum/2.
    if (sum / 2 < dp3.length) { // Ensure index is valid
        ans2 = dp3 [ sum / 2 ] ;
    }
  }
 
  // Final calculation of the answer using inclusion-exclusion principle.
  // total - (ans1 * 3) + (ans2 * 3)
  // The (ans1 * 3) accounts for cases where R >= S/2 (3 ways to assign S/2 items).
  // The (ans2 * 3) corrects for overcounting when R = S/2.
  let ans = ( total - ans1 * 3 + ans2 * 3 ) % mod ;
  
  // Ensure the result is positive.
  ans = ( ans + mod ) % mod ;
 
  // Output the final answer.
  console . log ( ans ) ;
}
 
// Read input from stdin and pass it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;