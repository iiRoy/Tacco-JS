"use strict"; /* This directive enables strict mode for better error handling. */

// Helper class for parsing input data.
function I( s , f ) {
  // Store input string split by newlines.
  this._s = s . split ( "\n" ) ;

  // Column index for current line.
  this._c = 0 ;

  // Line index.
  this._l = 0 ;

  // Conversion function, defaults to Number.
  this._f = f || Number ;
}

// Method to get the next token from the input.
I.prototype.a = function ( ) {
  var l = this._s[ this._l ] ; // Get the current line.

  if ( ! l ) {
    return ; // If line is empty, return undefined.
  }

  // Trim whitespace and split by space to get tokens.
  var t = l . trim ( ) . split ( " " ) ;
  var a = t [ this._c ] ; // Get the token at the current column index.

  this._c ++ ; // Move to the next column.

  // If all tokens on the current line have been consumed, reset column and move to next line.
  if ( t . length === this._c ) {
    this._c = 0 ;
    this._l ++ ;
  }
  return this._f ( a ) ; // Convert and return the token.
} ;

// Method to get all tokens from the current line.
I.prototype.l = function ( ) {
  var l = this._s[ this._l ] ; // Fetch current line again.

  if ( ! l ) {
    return ; // Return early if no line exists.
  }

  this._c = 0 ; // Reset column index.
  this._l ++ ; // Move to the next line.

  // Split the line, map each token using the conversion function, and return.
  return l . split ( " " ) . map ( this._f ) ;
} ;

/**
 * Recursively builds a multi-dimensional array.
 * @param {number[]} r - Dimensions of the array (e.g., [dim1, dim2]).
 * @param {*} t - Initial value for the innermost elements.
 * @returns {Array} The built array.
 */
function buildArray( r , t ) {
  let l = t || 0 ; // Initialize innermost value, default to 0.

  // Loop through dimensions in reverse.
  for ( let t = r . length ; t > 0 ; t -- ) {
    const n = r[ t - 1 ] ; // Get current dimension size.

    // Create an array of size 'n', fill it, and map each element.
    // JSON.parse(JSON.stringify(l)) is used to deep clone 'l' for objects/arrays.
    l = Array ( n ) . fill ( ) . map ( ( ) => JSON.parse ( JSON.stringify ( l ) ) ) ;
  }
  return l ; // Return the final multi-dimensional array.
}

// Calculates the "Permutation" like product for a range.
function Perm(m, n) {

  let r = 1; // Initialize result.

  // Loop from m+1 to n, multiplying each number.
  for (let i = m + 1; i <= n; i++) {
    r *= i;
  }

  return r; // Return the product.
}


// Main function where the program logic resides.
function main( input ) {
  const o = new I ( input ) ; // Create a new input parser instance.

  const N = o . a ( ) ; // Read the first number, N.
  const X = o . a ( ) ; // Read the second number, X.
  
  const S = [ ] ; // Initialize an array S.
  // Read N more numbers into S.
  for ( let i = 0 ; i < N ; i ++ ) {
    S . push ( o . a ( ) ) ;
  }

  S . sort ( ( a , b ) => a - b ) ; // Sort the array S in ascending order.

  // Pre-calculate factorials modulo 1000000007.
  const fac = [ 1 , 1 ] ;
  for ( let i = 2 ; i <= N ; i ++ ) {
    fac [ i ] = fac [ i - 1 ] * i % 1000000007 ;
  }

  // Initialize a cache for memoization using buildArray.
  // Dimensions are (N+1) x (X+1), initialized with -1.
  const cache = buildArray ( [ N + 1 , X + 1 ] , -1 ) ;

  // Recursive function with memoization.
  function calc ( k , x ) {
    // Check if result is already in cache.
    if ( cache [ k ] [ x ] !== -1 ) {
      return cache [ k ] [ x ] ;
    }

    // Base case: if x is less than the smallest element in S.
    if ( x < S [ 0 ] ) {
      cache [ k ] [ x ] = ( x * fac [ k ] ) % 1000000007 ;
    } else {
      let sum = 0 ; // Accumulator for sums.

      let i = 0 ; // Index for iterating through S.
      // Loop while S[i] is less than or equal to x and within bounds of S.
      while ( S [ i ] <= x && i < N ) {
        sum += calc ( k - 1 , x % S [ i ] ) ; // Recursive call with modulo.
        i += 1 ; // Increment index.
      }

      // Store the result in cache, applying modulo.
      cache [ k ] [ x ] = ( sum * Perm ( i , k ) ) % 1000000007 ;
    }

    return cache [ k ] [ x ] ; // Return the calculated/cached value.
  }

  console . log ( calc ( N , X ) ) ; // Output the final result.
}


// Read input from standard input and pass it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;