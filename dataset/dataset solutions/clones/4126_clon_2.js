"use strict" ;

/*
 * This function orchestrates the entire solution process.
 * It takes raw input and performs calculations to answer queries.
 */
function ExecuteSolution ( sourceText )
{
  let dataRows = sourceText.split ( '\n' ) ;

  // Begin Sieve of Eratosthenes implementation
  // to identify prime numbers up to a specific limit.

  const LIMIT_VAL = 101010 ; // Define maximum value for primality test.
  let primalityFlags = new Array( LIMIT_VAL ) . fill ( 1 ) ;

  primalityFlags [ 0 ] = primalityFlags [ 1 ] = 0 ; // 0 and 1 are not prime.

  for ( let currentNum = 2 ; currentNum < LIMIT_VAL ; currentNum ++ )
  {
    if ( ! primalityFlags [ currentNum ] )
    {
      continue ; // Skip if already marked as non-prime.
    }

    // Mark all multiples of the current prime as non-prime.
    for ( let multipleVal = currentNum * 2 ; multipleVal < LIMIT_VAL ; multipleVal += currentNum )
    {
      primalityFlags [ multipleVal ] = 0 ;
    }
  }

  // Identify "2017-like" numbers.
  // A number 'x' is 2017-like if 'x' is prime and (x+1)/2 is also prime.

  let candidateFlags = new Array ( LIMIT_VAL ) . fill ( 0 ) ;

  for ( let testIndex = 0 ; testIndex < LIMIT_VAL ; ++ testIndex )
  {
    if ( testIndex % 2 === 0 )
    { // Only odd numbers can be 2017-like (except 2, but (2+1)/2 isn't int).
      continue ;
    }

    if ( primalityFlags [ testIndex ] && primalityFlags [ ( testIndex + 1 ) / 2 ] )
    {
      candidateFlags [ testIndex ] = 1 ; // Mark as a special number.
    }
  }


  // Compute prefix sums (cumulative totals) for the special numbers.
  // This allows for efficient range sum queries later.

  let cumulativeTotals = new Array ( LIMIT_VAL + 1 ) . fill ( 0 ) ;

  for ( let sumIndex = 0 ; sumIndex < LIMIT_VAL ; ++ sumIndex )
  {
    cumulativeTotals [ sumIndex + 1 ] = cumulativeTotals [ sumIndex ] + candidateFlags [ sumIndex ] ;
  }


  // Process the incoming range queries.
  // Each query asks for the count of special numbers within a given range [L, R].

  const queryCount = dataRows . shift ( ) . trim ( ) . split ( /\s/ ) [ 0 ] - 0 ;

  for ( let queryIteration = 0 ; queryIteration < queryCount ; ++ queryIteration )
  {
    let queryRange = dataRows . shift ( ) . split ( /\s/ ) . map ( ( stringValue ) => stringValue - 0 ) ;
    let startIdx = queryRange [ 0 ] , endIdx = queryRange [ 1 ] ;
    ++ endIdx ; // Adjust end index for prefix sum calculation.

    console . log ( cumulativeTotals [ endIdx ] - cumulativeTotals [ startIdx ] ) ;
  }
}

// Entry point: Read input from standard input and pass to the solution function.
ExecuteSolution ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;