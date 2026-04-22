function prime( max )
{
  // This function computes prime numbers up to 'max' using a sieve method.
  // It returns an object where keys are prime numbers and values are true.

  var arr = [ ]; // Initialize an array for the sieve.

  // Populate the array with numbers from 0 to max.
  for ( var i = 0 ; i <= max ; i ++ )
  {
    arr [ i ] = i ; // Each index holds its own value initially.
  }

  /*
   * Mark 0 and 1 as not prime.
   * By definition, these are not prime numbers.
   */
  arr [ 0 ] = false ;
  arr [ 1 ] = false ;

  // Calculate the square root of max for the sieve limit.
  var sqrt = Math . floor ( Math . sqrt ( max ) ) ;

  // Sieve of Eratosthenes algorithm starts here.
  for ( var i = 2 ; i <= sqrt ; i ++ )
  {
    // If arr[i] is false, it means 'i' is already marked as not prime,
    // so we can skip it.
    if ( arr [ i ] == false )
    {
      continue ;
    }

    // Mark all multiples of 'i' as not prime.
    // Start from i*i (or i+i for the loop structure).
    for ( var j = i + i ; j <= max ; j += i )
    {
      arr [ j ] = false ; // Mark as not prime.
    }
  }

  // Create an object to store the prime numbers found.
  var obj = { } ;

  // Iterate through the sieve array to collect prime numbers.
  for ( var i = 0 ; i <= max ; i ++ )
  {
    // If arr[i] is not false, it means 'i' is a prime number.
    if ( arr [ i ] !== false )
    {
      obj [ arr [ i ] ] = true ; // Add the prime number to the object.
    }
  }

  // Return the object containing prime numbers.
  return obj ;
}

// Global variable 'p' stores primes up to 1,000,000.
var p = prime ( 1000000 ) ;

// Read input from standard input.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input: trim whitespace and split by newlines.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;

// Main loop to process multiple test cases.
while ( true )
{
  // Read 'n' and 'x' for the current test case.
  var nx = Arr . shift ( ) . split ( " " ) . map ( Number ) ;
  var n = nx [ 0 ] ; // The number of items.
  var x = nx [ 1 ] ; // The target sum.

  // Check for termination condition (n=0 and x=0).
  if ( n == 0 && x == 0 )
  {
    break ; // Exit the loop.
  }

  // Initialize a dynamic programming array (dp) to track possible sums.
  var dp = [ ] ;
  for ( var i = 0 ; i <= 1000000 ; i ++ )
  {
    dp [ i ] = false ; // Initially, no sums are possible.
  }

  // Array to store the input values.
  var arr = [ ] ;

  // Read 'n' items and mark them as possible sums in dp.
  for ( var i = 0 ; i < n ; i ++ )
  {
    var v = Arr . shift ( ) - 0 ; // Read value and convert to number.
    arr . push ( v ) ;           // Add to the list of items.
    dp [ v ] = true ;            // This value itself is a possible sum.
  }

  // Base case for DP: sum of 0 is always possible.
  dp [ 0 ] = true ;

  // Dynamic programming to find all possible sums.
  // Iterate through all possible sums up to 1,000,000.
  for ( var i = 0 ; i <= 1000000 ; i ++ )
  {
    // For each possible sum 'i', try adding each item from 'arr'.
    for ( var j = 0 ; j < arr . length ; j ++ )
    {
      // If adding arr[j] exceeds the maximum sum, skip.
      if ( i + arr [ j ] > 1000000 )
      {
        continue ;
      }

      // If sum 'i' is possible, then sum 'i + arr[j]' becomes possible.
      if ( dp [ i ] )
      {
        dp [ i + arr [ j ] ] = true ;
      }
    }
  }

  // Find the largest prime number less than or equal to 'x' that can be formed.
  for ( var i = x ; i > 0 ; i -- )
  {
    // Check if 'i' is a possible sum (dp[i]) AND 'i' is a prime number (p.hasOwnProperty(i)).
    if ( dp [ i ] && p . hasOwnProperty ( i ) )
    {
      break ; // Found the largest such prime sum.
    }
  }

  // Output the result.
  // If 'i' became 0, it means no such prime sum was found.
  console . log ( ( i === 0 ) ? "NA" : i ) ;
}