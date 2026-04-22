/*
 * This is a self-executing anonymous function (IIFE)
 * that sets up a custom input parsing utility.
 * It provides methods to read various types of data from a string input.
 */
var GET = ( function ( ) {

  // Factory function 'f': Creates a new instance of the input reader 'g'.
  function f ( s ) {
    return new g ( s ) ;
  }

  // Constructor 'g': Initializes the input reader.
  // Takes a string 's' (the entire input content).
  function g ( s ) {
    this._s = s . trim ( ) . split ( "\n" ) ; // Store lines, trimmed and split by newline.
    this._y = 0 ;                            // Current line index, starts at the first line.
  }

  /*
   * Prototype methods for the 'g' object.
   * These methods are used to consume parts of the input.
   */

  // Method 'a': Reads a single item from the current line.
  // If 'f' is true, returns the item as a string; otherwise, attempts to parse as a number.
  g . prototype . a = function ( f ) {
    var s = this._s , // Reference to the array of input lines.
        y = this._y , // Current line index.
        r ;           // Variable to hold the result.

    // Check if the current line (s[y]) is still a string.
    // If it is, it means it hasn't been processed into an array of items yet.
    if ( typeof s [ y ] === "string" ) {
      // Split the line by spaces and reverse it.
      // Reversing allows efficient `pop()` operations (removing from the end).
      s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
    }

    r = s [ y ] . pop ( ) ; // Retrieve the last item from the (reversed) current line.

    // If the current line is now empty after popping an item,
    // advance to the next line for subsequent reads.
    if ( ! s [ y ] . length ) {
      this._y ++ ;
    }

    // Return the item: raw string if 'f' is truthy, otherwise as a number (unary plus operator).
    return f ? r : + r ;
  } ;

  // Method 'l': Reads an entire line of items.
  // If 'f' is true, returns an array of strings; otherwise, an array of numbers.
  g . prototype . l = function ( f ) {
    // Get the current line, split it by spaces, and then increment the line index.
    var s = this._s [ this._y ++ ] . split ( " " ) ;

    // Return the array: raw strings if 'f' is truthy, otherwise map all elements to numbers.
    return f ? s : s . map ( a => + a ) ;
  } ;

  // Method 'm': Reads a matrix (multiple lines, each with multiple items).
  // 'n' specifies the number of lines to read.
  // If 'f' is true, returns a 2D array of strings; otherwise, a 2D array of numbers.
  g . prototype . m = function ( n , f ) {
    // Slice 'n' lines from the input, then advance the line index by 'n'.
    // Map each sliced line to an array of strings by splitting it.
    var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;

    // Return the matrix: raw strings if 'f' is truthy, otherwise map all elements in all sub-arrays to numbers.
    return f ? r : r . map ( a => a . map ( a => + a ) ) ;
  } ;

  // Method 'r': Reads raw lines (multiple lines, each treated as a single item).
  // 'n' specifies the number of lines to read.
  // If 'f' is true, returns an array of strings; otherwise, an array of numbers.
  g . prototype . r = function ( n , f ) {
    // Slice 'n' lines from the input, then advance the line index by 'n'.
    var r = this._s . slice ( this._y , this._y += n ) ;

    // Return the array: raw strings if 'f' is truthy, otherwise map all elements to numbers.
    return f ? r : r . map ( a => + a ) ;
  } ;

  return f ; // The IIFE returns the factory function 'f', which is assigned to GET.

} ) ( ) ;


// Initialize the input object 'o' using the GET utility.
// It reads input from standard input ("/dev/stdin") as UTF-8 encoded text.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 * Function: xArray
 * Dynamically creates a multi-dimensional array initialized with a value or expression.
 * The first argument 'v' is the initialization value/expression.
 * Subsequent arguments are the dimensions of the array (e.g., xArray(0, 2, 3) for a 2x3 array of zeros).
 * It uses `eval()` to construct and execute the array creation code string.
 */
function xArray ( v ) {
  var a = arguments ,          // 'a' holds all arguments passed to xArray.
      l = a . length ,         // 'l' stores the total number of arguments.
      // 'r' starts with the innermost array creation string.
      // It creates an array of size a[l-1] filled with 0, then maps to 'v'.
      r = "Array ( a [ " + --l + " ] ) . fill ( 0 ) . map ( x => { return " + v + " ; } )" ;

  // Loop to build the string for higher dimensions, from inside out.
  // Each iteration wraps the current 'r' with another Array.map structure.
  while ( --l ) {
    r = "Array ( a [ " + l + " ] ) . fill ( 0 ) . map ( x => " + r + " )" ;
  }

  // Execute the dynamically constructed string to create and return the array.
  return eval ( r ) ;
}


// Define a global modulus value, commonly used in modular arithmetic operations.
var mod = 1000003 ;


/*
 * Function: abmod
 * Performs chained modular multiplication of an arbitrary number of arguments.
 * It takes the first argument, then multiplies it by subsequent arguments,
 * all modulo 'mod'.
 *
 * The multiplication `((r>>16)*a[i]%mod*65536+(r&65535)*a[i++])%mod`
 * is an optimized way to perform (r * a[i]) % mod.
 * It splits 'r' into high and low 16-bit parts to handle intermediate products
 * that might exceed standard 32-bit integer limits before taking the modulo,
 * especially useful when 'mod' is large.
 */
function abmod ( ) {
  var a = arguments , // 'a' contains all numbers to be multiplied.
      r = a [ 0 ] ,   // 'r' stores the running product, initialized with the first number.
      i = 1 ;         // 'i' is the index for iterating through subsequent numbers.

  // Loop through the remaining arguments, performing modular multiplication.
  for ( ; i < a . length ; ) {
    // Optimized modular multiplication step.
    // (r >> 16) gets the high 16 bits of r.
    // (r & 65535) gets the low 16 bits of r.
    // This technique helps prevent overflow for intermediate products before % mod.
    r = ( ( r >> 16 ) * a [ i ] % mod * 65536 + ( r & 65535 ) * a [ i ++ ] ) % mod ;
  }

  return r ; // Return the final modular product.
}


// Initialize an array to store pre-computed factorials modulo 'mod'.
// `fac[0]` and `fac[1]` are both 1.
var fac = [ 1 , 1 ] ;


/*
 * Function: fSet
 * Pre-computes factorials up to 'n' modulo 'mod' and stores them in the 'fac' array.
 * `fac[i] = (fac[i-1] * i) % mod`.
 */
function fSet ( n ) {
  // Loop from i = 2 up to 'n' (inclusive) to calculate each factorial.
  for ( var i = 2 ; i <= n ; ) {
    // Calculate fac[i] using the previous factorial and the current 'i',
    // ensuring the result is kept modulo 'mod' using abmod.
    fac [ i ] = abmod ( fac [ i - 1 ] , i ++ ) ;
  }
}


/*
 * Function: modinv
 * Computes the modular multiplicative inverse of 'a' modulo 'mod'.
 * It uses the Extended Euclidean Algorithm.
 * Returns 'x' such that `(a * x) % mod = 1`.
 * Assumes 'mod' is a prime number for 'a' to have an inverse.
 */
function modinv ( a ) {
  var b = mod , // 'b' starts as the modulus.
      u = 1 ,   // Coefficient for 'a' (represents x in a*x + mod*y = gcd).
      v = 0 ,   // Coefficient for 'mod' (represents y in a*x + mod*y = gcd).
      t ;       // Temporary variable used for swaps during the algorithm.

  // The core of the Extended Euclidean Algorithm.
  // It iteratively reduces 'a' and 'b' while updating 'u' and 'v'.
  while ( b ) {
    t = a / b | 0 ; // Integer division: q = a / b.
    a -= t * b ;    // Update a: a = a - q*b (new a is remainder).
    u -= t * v ;    // Update u: u = u - q*v.

    // Swap (a, b) and (u, v) to continue the algorithm.
    // This is equivalent to (a, b) = (b, a % b) and (u, v) = (v, u - q*v).
    t = a ;
    a = b ;
    b = t ;

    t = u ;
    u = v ;
    v = t ;
  }

  // Ensure the result 'u' is positive and within the range [0, mod-1].
  u %= mod ;
  return u < 0 ? u + mod : u ;
}


/*
 * Function: nPrmod
 * Computes permutations P(n, r) modulo 'mod'.
 * The formula for P(n, r) is n! / (n-r)!.
 * In modular arithmetic, this is calculated as `(n! * ( (n-r)! )^-1 ) % mod`.
 */
function nPrmod ( n , r ) {
  // Calculate n! % mod using the pre-computed 'fac' array.
  // Calculate the modular inverse of (n-r)! % mod.
  // (n - r + mod) % mod handles cases where (n - r) might be negative,
  // ensuring a non-negative index for 'fac'.
  return abmod ( fac [ n ] , modinv ( fac [ ( n - r + mod ) % mod ] ) ) ;
}


/*
 * Function: powmod
 * Computes (a^n) % mod using binary exponentiation (also known as exponentiation by squaring).
 * This method is efficient for large exponents 'n'.
 */
function powmod ( a , n ) {
  var r = 1 ; // Initialize the result to 1 (a^0 = 1).

  // Loop while the exponent 'n' is greater than 0.
  // In each iteration, 'a' is squared (modulo mod) and 'n' is halved.
  for ( ; n ; a = abmod ( a , a ) , n >>= 1 ) {
    // If the least significant bit of 'n' is 1 (i.e., n is odd),
    // multiply the current result 'r' by 'a' (modulo mod).
    if ( n & 1 ) {
      r = abmod ( a , r ) ;
    }
  }

  return r ; // Return the final result (a^n) % mod.
}


// Main execution block: Calls the main function and prints its return value to the console.
console . log ( main ( ) ) ;


/**
 * The primary logic of the program.
 * It reads a series of queries, performs specific modular arithmetic calculations for each,
 * and then returns the results as a newline-separated string.
 */
function main ( ) {

  // Read the number of queries 'q' from the input using the 'a' method of the 'o' object.
  var q = o . a ( ) ;

  // Initialize an array 'ans' to store the answer for each query.
  // It's pre-filled with zeros for 'q' elements.
  var ans = Array ( q ) . fill ( 0 ) ;

  // Pre-compute factorials up to 'mod' for use in modular permutation calculations.
  fSet ( mod ) ;

  // Loop through each of the 'q' queries.
  for ( var i = 0 ; i < q ; i ++ ) {

    // Read an entire line for the current query, which contains three values: x, d, and n.
    var t = o . l ( ) , // 't' is an array [x, d, n].
        x = t [ 0 ] ,
        d = t [ 1 ] ,
        n = t [ 2 ] ;

    // Optimization: If 'n' is greater than or equal to 'mod',
    // the result often simplifies or becomes 0 in modular arithmetic (e.g., if 'mod' is prime).
    // In this specific problem context, such cases are skipped.
    if ( n >= mod ) {
      continue ; // Move to the next query.
    }

    // Conditional logic based on the value of 'd'.
    if ( d === 0 ) {
      // If 'd' is 0, the calculation simplifies to (x^n) % mod.
      ans [ i ] = powmod ( x , n ) ;
    } else {
      // If 'd' is not 0, perform a more complex calculation involving modular inverse and permutations.

      // Calculate `a = ( (mod - (x * d^-1) % mod) % mod + mod ) % mod`.
      // This expression ensures 'a' is a positive value within [0, mod-1].
      // `abmod(x, modinv(d))` calculates `(x * d^-1) % mod`.
      var a = ( ( mod - abmod ( x , modinv ( d ) ) ) % mod + mod ) % mod ;

      // Calculate the modular permutation P(a, n) % mod.
      var p = nPrmod ( a , n ) ;

      // Calculate `( (mod - d)^n ) % mod`.
      var m = powmod ( mod - d , n ) ;

      // The final answer for this query is the modular product of 'p' and 'm'.
      ans [ i ] = abmod ( p , m ) ;
    }
  }

  // Join all the calculated answers with newline characters and return the resulting string.
  return ans . join ( "\n" ) ;
}