/*
 * This function calculates something based on the input 'n'.
 * It uses dynamic programming and a sequence of numbers generated in the first loop.
 */
function aaa ( n )
{
  // Initialize some variables for the sequence generation
  var m = 0 ,
      a = 1 ,
      b = 1 ,
      c = 1
  ; // Semicolon can be on its own line after a complex declaration

  var rtodd = [ ]; // Array to store generated sequence elements
  rtodd.push( 0 ); // Pushing the initial value

  while ( a <= n )
  {
    m ++ ; // Increment counter m
    rtodd.push( a ); // Add 'a' to the array
    c ++ ;
    b += c ;
    a += b ; // Update a, b, c for the next iteration
  }

  // Dynamic programming table initialization
  var dp = [ ];
  dp [ 0 ] = [ ];
  dp [ 0 ] [ 0 ] = 0 ;

  // Initialize inner arrays for dp table
  for ( var i = 1 ; i < 5 ; i ++ )
  {
    dp [ i ] = [ ];
  }

  // Initialize first row of dp table with a large value
  for ( var i = 1 ; i <= n ; i ++ )
  {
    dp [ 0 ] [ i ] = 1000000000 ;
  }

  // Main DP calculation loop
  for ( var iii = 1 ; iii <= m ; iii ++ )
  {
    var i = iii % 5 ; // Current row index
    var ii = i - 1 ;  // Previous row index

    if ( ii < 0 )
    { // Handle wrap-around for ii
      ii = 4 ;
    }

    for ( var j = 0 ; j <= n ; j ++ )
    {
      // Check condition for DP state transition
      if ( j < rtodd [ i ] )
      {
        dp [ i ] [ j ] = dp [ ii ] [ j ] ; // Case 1: element not included
      }
      else
      {
        // Case 2: element included, apply min operation
        dp [ i ] [ j ] = dp [ ii ] [ j ] < dp [ i ] [ j - rtodd [ i ] ] + 1 ?
                         dp [ ii ] [ j ] :
                         dp [ i ] [ j - rtodd [ i ] ] + 1 ;
      }
    }
  }

  // Final modulo operation for m
  m %= 5 ;

  // Return the result from the DP table
  return dp [ m ] [ n ] ;
}

/* This is another function, bbb,
 * which also takes an integer n as input.
 * It has a similar structure to aaa but with a different
 * condition for populating the 'rtodd' array.
 */
function bbb ( n )
{
  var m = 0, a = 1, b = 1, c = 1; // Initializing multiple variables on one line

  var rtodd = [ ]; // Declare and initialize rtodd array
  rtodd . push ( 0 ); // Add the first element

  while ( a <= n )
  {
    // A key difference from aaa: only add odd numbers to rtodd
    if ( a % 2 )
    {
      m ++ ; // Increment m only for odd 'a' values
      rtodd . push ( a ); // Add 'a' to rtodd
    }

    c ++ ; // Increment c
    b += c ; // Update b
    a += b ; // Update a
  }

  var dp = [ ]; // DP table declaration
  dp [ 0 ] = [ ]; // Initialize the first sub-array
  dp [ 0 ] [ 0 ] = 0 ; // Set the base case

  // Loop to initialize remaining sub-arrays
  for ( var i = 1 ; i < 5 ; i ++ )
  {
    dp [ i ] = [ ];
  }

  // Initialize the first row for DP with a very large number
  for ( var i = 1 ; i <= n ; i ++ )
  {
    dp [ 0 ] [ i ] = 1000000000 ;
  }

  // Main dynamic programming calculation
  for ( var iii = 1 ; iii <= m ; iii ++ )
  {
    var i = iii % 5 ; // Current row index calculation
    var ii = i - 1 ; // Previous row index

    if ( ii < 0 )
    { // Adjust ii if it goes below zero
      ii = 4 ;
    }

    for ( var j = 0 ; j <= n ; j ++ )
    {
      if ( j < rtodd [ i ] )
      {
        dp [ i ] [ j ] = dp [ ii ] [ j ] ; // Option 1: Don't use the current item
      }
      else
      {
        dp [ i ] [ j ] = dp [ ii ] [ j ] < dp [ i ] [ j - rtodd [ i ] ] + 1 ?
                         dp [ ii ] [ j ] :
                         dp [ i ] [ j - rtodd [ i ] ] + 1 ; // Option 2: Use the current item, take minimum
      }
    }
  }

  m %= 5 ; // Final adjustment of m

  return dp [ m ] [ n ] ; // Return the computed result
}

// Main function to process input and output results.
function Main ( input )
{
  input = input.split ( "\n" ) ; // Split the input string by newline characters

  // Loop indefinitely until a specific condition is met
  for ( var i = 0 ; 1 ; i ++ )
  {
    var n = parseInt ( input [ i ] , 10 ) ; // Parse current line as an integer
    if ( n == 0 )
    { // If n is 0, break the loop
      break ;
    }
    // Output the results of both aaa and bbb functions for the current n
    console . log ( aaa ( n ) , bbb ( n ) ) ;
  }

}

// This line reads input from standard input and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;