/*
 * This is the primary entry point function
 * for processing the input data.
 * It calculates some specific combinations based on frequencies.
 */
const main = ( input ) => {
  // First, we prepare the input string by trimming and splitting it.
  input = input.trim().split( '\n' ) ;

  // The numbers are extracted from the second line of the input.
  const nums = input[ 1 ].split( ' ' ) ;


  /*
   * An object 'x' is used to store the frequency count
   * of each number present in the 'nums' array.
   */
  const x = { } ;

  // Loop through the numbers to populate the frequency map.
  for ( let i = 0 ; i < nums.length ; i ++ ) {
    x[ nums[ i ] ] = ~~x[ nums[ i ] ] + 1 ; // Increment count, defaulting to 0 if not exists.
  }
  /*
   * The following line was an alternative way to count frequencies
   * using forEach, but the for-loop was chosen for this version.
   * nums.forEach( v => x[v] = ~~x[v] + 1 )
   */

  // A cache object is used to store pre-calculated results
  // to avoid redundant computations for combinations.
  const cache = { } ;

  /*
   * This is the main processing loop.
   * For each number, it temporarily decrements its count,
   * calculates combinations if not cached, and then restores the count.
   */
  for ( let i = 0 ; i < nums.length ; i ++ ) {
    // Temporarily decrement the count of the current number.
    x[ nums[ i ] ] -= 1 ;

    // Check if the result for this number is already in the cache.
    if ( !cache[ nums[ i ] ] ) {
      let sum = 0 ; // Initialize sum for combinations.

      /*
       * Iterate over the entries of the frequency map 'x'.
       * For each number with a frequency greater than 1,
       * calculate combinations of 2 (C(n, 2)) and add to sum.
       */
      for ( let [ , v ] of Object.entries( x ) ) {
        sum += v > 1 ? c( v, 2 ) : 0 ; // Add C(v, 2) if v > 1, else 0.
      }
      // Store the calculated sum in the cache for future reference.
      cache[ nums[ i ] ] = sum ;
    }
    // Output the cached or newly calculated result to the console.
    console.log( cache[ nums[ i ] ] ) ;

    // Restore the count of the current number in the frequency map.
    x[ nums[ i ] ] += 1 ;
  }

  /*
   * Another alternative implementation of the main loop,
   * commented out to use the for-loop version above.
   *
   * nums.forEach( v => {
   *   x[v] -= 1 ;
   *
   *   if ( !cache[v] ) {
   *     let sum = 0 ;
   *     Object.keys(x).forEach(o => sum += (x[o] > 1) ?  c(x[o], 2) : 0) ;
   *     cache[v] = sum ;
   *   }
   *   console.log(cache[v]) ;
   *
   *   x[v] += 1 ;
   * } ) ;
   */
} ;


/*
 * This helper function calculates combinations (n C k)
 * specifically for k=2, but generalized here for any k.
 * It computes n * (n-1) * ... * (n-k+1) / k!
 * In this context, it's used as C(a, b).
 */
const _cmb = ( a , b ) => {
  let numerator = 1 ; // Initialize numerator for the combination formula.
  // Calculate the 'falling factorial' part of the numerator.
  for ( let i = 0 ; i < b ; i ++ ) {
    numerator *= a ; // Multiply by current 'a'.
    a -- ;           // Decrement 'a' for the next iteration.
  }

  let denominator = 1 ; // Initialize denominator for the factorial part.
  // Calculate the factorial of 'b' for the denominator.
  while ( b > 0 ) {
    denominator *= b ; // Multiply by current 'b'.
    b -- ;             // Decrement 'b' until it reaches zero.
  }

  // Return the final combination result.
  return numerator / denominator ;
} ;


/*
 * The memoization higher-order function.
 * It takes a function 'fn' and returns a new function
 * that caches the results of 'fn' based on its arguments.
 */
const memo = ( fn ) => {
  const cache = { } ; // Internal cache for memoized function results.
  return ( a , b ) => {
    // Construct a unique key for the cache based on arguments 'a' and 'b'.
    const cacheKey = `${a}c${b}` ;

    // If the result is not in the cache, compute it and store it.
    if ( !cache[ cacheKey ] ) {
      cache[ cacheKey ] = fn( a , b ) ;
    }
    // Return the cached result.
    return cache[ cacheKey ] ;
  } ;
} ;

// Create a memoized version of the combination function '_cmb'.
// This 'c' function will now automatically cache its results.
const c = memo( _cmb ) ;

/*
 * This line handles execution:
 * If the environment variable MYTEST is set, it calls a 'test()' function (not provided here).
 * Otherwise, it reads input from standard input and passes it to the 'main' function.
 */
process.env.MYTEST ? test() : main( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ) ;