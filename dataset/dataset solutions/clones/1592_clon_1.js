"use strict" ; /* Enable strict mode for cleaner code */

// This section handles input reading from standard input.
// It's designed for competitive programming contexts where input
// is often provided in a specific format.
var input = require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ; // Read all input from stdin
var cin = input.split( / |\n/ ) , cid = 0 ; /* Split input by spaces or newlines,
                                             and initialize a counter for current index */

// Helper function to get the next number from the input array.
// The '+' prefix converts the string to a number.
function next( ) {
    return + cin[ cid ++ ] ; // Increment cid after use
}

// Helper function to get the next string from the input array.
function nextstr( )
{
    return cin[ cid ++ ] ; // Just return the string
}

// Helper function to get the next BigInt from the input array.
// Useful for very large numbers that exceed standard JavaScript number limits.
function nextbig( )
{
    return BigInt( cin[ cid ++ ] ) ; // Convert to BigInt
}

// Helper function to read 'n' elements from the input.
// If 'a' is true, return as strings; otherwise, convert to numbers.
function nexts( n , a )
{
    /* This is a multi-purpose input reading function */
    if ( a )
    {
        return cin.slice( cid , cid += n ) ; // Return raw strings
    }
    else
    {
        return cin.slice( cid , cid += n ).map( a => + a ) ; // Convert to numbers
    }
}

// Helper function to read a 2D matrix of 'h' rows and 'w' columns.
// If 'a' is true, return as strings; otherwise, convert to numbers.
function nextm( h , w , a )
{
    var r = [ ] , i = 0 ; // Initialize result array and loop counter
    if ( a )
    {
        for ( ; i < h ; i ++ )
        {
            r.push( cin.slice( cid , cid += w ) ) ; // Push array of strings
        }
    }
    else
    {
        for ( ; i < h ; i ++ )
        {
            r.push( cin.slice( cid , cid += w ).map( a => + a ) ) ; // Push array of numbers
        }
    }
    return r ; // Return the 2D array
}

// Helper function to create multi-dimensional arrays initialized with a value.
// It uses eval, which can be risky but is common in some competitive programming setups.
function xArray( v )
{
    var a = arguments , l = a.length , r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" ;
    while ( -- l )
    {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
    }
    return eval( r ) ; // Execute the generated string as JavaScript code
}

// Call the main logic function and store its result.
var myOut = main( ) ;

// If main() returns a value (not undefined), print it to console.
if ( myOut !== undefined )
{
    console.log( String( myOut ) ) ; /* Ensure output is a string */
}


// The core logic of the program resides within the main function.
// This structure is typical for competitive programming challenges.
function main( ) {
  var n = next( ) ; // Read the first input as 'n'

  /*
   * dp is a 2D array, initialized with a very small negative number (-1e9)
   * to represent infinity or an unvisited state.
   * n+1 dimensions to accommodate 0-indexed and 1-indexed values.
   */
  var dp = xArray( -1e9 , n + 1 , n + 1 ) , add = 0 ;

  /*
   * Read the first two numbers, sort them, and store in 'a'.
   * 'q' is declared here but used later as a queue for DP updates.
   */
  var a = nexts( 2 ).sort( ( a , b ) => a - b ) , q ;

  // Initialize base cases for the dynamic programming table.
  // These represent initial states or conditions.
  dp[ 0 ][ 0 ] = dp[ 0 ][ a[ 0 ] ] = dp[ 0 ][ a[ 1 ] ] = dp[ a[ 0 ] ][ a[ 1 ] ] = 0 ;

  // Loop 'n' times to process subsequent inputs.
  // This likely represents processing 'n' sets of data or steps.
  for ( var i = 1 ; i < n ; i ++ )
  {
    /* Read three numbers for each iteration, sort them.
     * Sorting ensures a consistent order (u <= v <= w) for processing. */
    a = nexts( 3 ).sort( ( a , b ) => a - b ) ;
    solve( ... a ) ; // Call the 'solve' function with the three sorted numbers
  }

  /* After the loop, read one more number. This might be a final query
   * or a specific value needed for the result calculation. */
  a = next( ) ;

  // Calculate the final result.
  // It takes the maximum of two DP states and adds the 'add' counter.
  return Math.max( dp[ 0 ][ 0 ] , dp[ a ][ a ] + 1 ) + add ;

  /*
   * Nested function 'solve' is the core of the DP state transitions.
   * It takes three sorted values (u, v, w) and updates the DP table.
   */
  function solve( u , v , w )
  {
    /*
     * If u, v, w are all equal, it means a specific condition is met,
     * so increment 'add' and return. This is an edge case or special condition.
     */
    if ( u === w )
    {
      return add ++ ;
    }

    q = [ ] ; // Initialize a new empty queue for this 'solve' call

    // Call various helper functions to update the DP table based on (u, v, w).
    // These functions push potential DP updates onto the 'q' queue.
    solve1( u ) ; // Handles cases involving only 'u'
    if ( u < v )
    {
      solve1( v ) ; // Handles cases involving only 'v', if v is distinct from u
    }
    if ( v < w )
    {
      solve1( w ) ; // Handles cases involving only 'w', if w is distinct from v
    }

    solve2( u , v ) ; // Handles cases involving 'u' and 'v'
    if ( v < w )
    {
      solve2( u , w ) ; // Handles cases involving 'u' and 'w', if w is distinct from v
    }
    if ( u < v )
    {
      solve2( v , w ) ; // Handles cases involving 'v' and 'w', if v is distinct from u
    }

    solve3( u , v , w ) ; // Handles cases involving all three 'u', 'v', 'w'

    /*
     * After all potential updates are queued, process them.
     * This ensures that updates are applied correctly without interfering
     * with reads from the current DP state.
     */
    while ( q.length )
    {
      var x = q.pop( ) , y = q.pop( ) , z = q.pop( ) ; // Pop in reverse order: z, y, x
      if ( dp[ x ][ y ] < z )
      {
        dp[ x ][ y ] = z ; // Update DP table if 'z' is a better value
      }
    }
  }

  /*
   * Helper function 'solve1' focuses on updating DP states
   * where one of the values is 'u'.
   */
  function solve1( u )
  {
    f1( 0 , 0 , u , u ) ; // Update dp[0][0] based on dp[u][u] + 1

    /*
     * Loop through 'i' values less than 'u'.
     * This likely represents states where 'i' is one element and 'u' is another.
     */
    for ( var i = 0 ; i < u ; i ++ )
    {
      f0( i , u , 0 , i ) ; // Update dp[i][u] based on dp[0][i]
    }

    /*
     * Loop through 'i' values from 'u' up to 'n'.
     * This covers states where 'u' is fixed and 'i' varies.
     */
    for ( var i = u ; i <= n ; i ++ )
    {
      f0( u , i , 0 , i ) ; // Update dp[u][i] based on dp[0][i]
    }
  }

  /*
   * Helper function 'solve2' focuses on updating DP states
   * involving 'u' and 'v'.
   */
  function solve2( u , v )
  {
    f0( u , v , 0 , 0 ) ; // Update dp[u][v] based on dp[0][0]
    f1( 0 , v , u , u ) ; // Update dp[0][v] based on dp[u][u] + 1

    if ( u < v )
    {
      f1( 0 , u , v , v ) ; // If u < v, update dp[0][u] based on dp[v][v] + 1
    }
    else // u = v, a special case
    {
      for ( var i = 0 ; i < u ; i ++ )
      {
        f1( 0 , i , i , u ) ; // Update dp[0][i] based on dp[i][u] + 1
      }
      for ( var i = u ; i <= n ; i ++ )
      {
        f1( 0 , i , u , i ) ; // Update dp[0][i] based on dp[u][i] + 1
      }
    }
  }

  /*
   * Helper function 'solve3' handles the most complex updates,
   * involving 'u', 'v', and 'w'.
   */
  function solve3( u , v , w )
  {
    f1( v , w , u , u ) ; // Update dp[v][w] based on dp[u][u] + 1

    if ( u < v )
    {
      f1( u , w , v , v ) ; // If u < v, update dp[u][w] based on dp[v][v] + 1
      if ( v < w )
      {
        f1( u , v , w , w ) ; // If v < w, update dp[u][v] based on dp[w][w] + 1
      }
      else // v = w, another specific case
      {
        for ( var i = 0 ; i < u ; i ++ )
        {
          f1( i , u , i , w ) ; // Update dp[i][u] based on dp[i][w] + 1
        }
        for ( var i = u ; i < w ; i ++ )
        {
          f1( u , i , i , w ) ; // Update dp[u][i] based on dp[i][w] + 1
        }
        for ( var i = w ; i <= n ; i ++ )
        {
          f1( u , i , w , i ) ; // Update dp[u][i] based on dp[w][i] + 1
        }
      }
    }
    else // u = v, yet another specific case
    {
      f1( u , u , w , w ) ; // Update dp[u][u] based on dp[w][w] + 1
      for ( var i = 0 ; i < u ; i ++ )
      {
        f1( i , w , i , u ) ; // Update dp[i][w] based on dp[i][u] + 1
      }
      for ( var i = u ; i < w ; i ++ )
      {
        f1( i , w , u , i ) ; // Update dp[i][w] based on dp[u][i] + 1
      }
      for ( var i = w ; i <= n ; i ++ )
      {
        f1( w , i , u , i ) ; // Update dp[w][i] based on dp[u][i] + 1
      }
    }
  }

  /*
   * Function 'f0' is a generic update function for DP states.
   * It checks if dp[c][d] is greater than dp[a][b]. If so, it queues
   * an update for dp[a][b] with the value dp[c][d].
   */
  function f0( a , b , c , d )
  {
    if ( dp[ a ][ b ] < dp[ c ][ d ] )
    {
      q.push( dp[ c ][ d ] , b , a ) ; // Push value, column index, row index
    }
  }

  /*
   * Function 'f1' is similar to 'f0' but adds 1 to the source value.
   * This is typical for problems where each step adds a cost or value.
   */
  function f1( a , b , c , d )
  {
    if ( dp[ a ][ b ] < dp[ c ][ d ] + 1 )
    {
      q.push( dp[ c ][ d ] + 1 , b , a ) ; // Push value + 1, column index, row index
    }
  }
}
// End of main function and its nested helpers.