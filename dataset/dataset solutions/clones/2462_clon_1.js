/* This ensures strict mode for the entire script. */
"use strict" ;

/*
 * This is an Immediately Invoked Function Expression (IIFE)
 * which defines and returns a 'GET' function.
 * The GET function is designed to parse input data.
 */
var GET = ( function ( ) {

  // Inner helper function to create a new G instance.
  function f ( s ) {
    return new g ( s ) ;
  }

  /*
   * Constructor function 'g' for processing input strings.
   * It stores lines and maintains a current line index.
   */
  function g ( s ) {
    this . _s = s . trim ( ) . split ( "\n" ) ; // Split input by newlines after trimming.
    this . _y = 0 ; // Initialize line counter.
  }

  // Prototype method 'a' (advance) to read a single item.
  g . prototype . a = function ( f ) {
    var s = this . _s , // Reference to the lines array.
        y = this . _y , // Current line index.
        r ;             // Variable to hold the result.

    /*
     * If the current line hasn't been processed into individual items yet,
     * it splits it by space and reverses it for easy popping from the end.
     */
    if ( typeof s [ y ] === "string" ) {
      s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
    }

    r = s [ y ] . pop ( ) ; // Get the last item from the current line.

    // If the current line is now empty, advance to the next line.
    if ( ! s [ y ] . length ) {
      this . _y ++ ;
    }

    // Return the item, optionally parsed as a number.
    return f ? r : + r ;
  } ;

  /*
   * Prototype method 'l' (line) to read an entire line.
   */
  g . prototype . l = function ( f ) {
    // Split the current line into items and increment the line counter.
    var s = this . _s [ this . _y ++ ] . split ( " " ) ;

    // Return the items, optionally parsed as numbers.
    return f ? s : s . map ( a => + a ) ;
  } ;

  /**
   * Prototype method 'm' (matrix) to read 'n' lines as a 2D array.
   */
  g . prototype . m = function ( n , f ) {
    /*
     * Slice 'n' lines from the input, split each line by space,
     * and update the line counter.
     */
    var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;

    // Return the matrix, optionally with elements parsed as numbers.
    return f ? r : r . map ( a => a . map ( a => + a ) ) ;
  } ;

  /*
   * Prototype method 'r' (raw) to read 'n' raw lines.
   */
  g . prototype . r = function ( n , f ) {
    // Slice 'n' lines from the input and update the line counter.
    var r = this . _s . slice ( this . _y , this . _y += n ) ;

    // Return the raw lines, optionally with elements parsed as numbers.
    return f ? r : r . map ( a => + a ) ;
  } ;

  // The IIFE returns the 'f' function, which is assigned to GET.
  return f ;

} ) ( ) ; // End of GET IIFE.


// Initialize an 'o' object using the GET function to read from standard input.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 * Function 'xArray' creates a multi-dimensional array
 * initialized with a given value 'v'.
 * It uses 'eval' for dynamic array creation based on arguments.
 */
function xArray ( v ) {
  var a = arguments , // All arguments passed to the function.
      l = a . length , // Number of arguments.
      r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ; // Innermost array creation string.

  /*
   * Loop to construct the outer array creation strings.
   * Decrements 'l' for each dimension.
   */
  while ( -- l ) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
  }

  return eval ( r ) ; // Execute the dynamically generated string to create the array.
}


// Modulo constant used for arithmetic operations.
var mod = 998244353 ;


/*
 * Function 'mul' performs modular multiplication for an arbitrary number of arguments.
 * It uses an optimized multiplication technique to prevent overflow before modulo.
 */
function mul ( ) {
  // 'a' holds all arguments, 'r' is the running product, 'i' is the loop counter.
  for ( var a = arguments , r = a [ 0 ] , i = a . length ; -- i ; ) {
    // Optimized modular multiplication: (A*B) % M = ((A_high * 2^16 + A_low) * B) % M
    // This splits a number into 16-bit parts to prevent intermediate overflow
    // if A*B exceeds standard 53-bit integer precision before modulo.
    r = ( ( r >> 16 ) * a [ i ] % mod * 65536 + ( r & 65535 ) * a [ i ] ) % mod ;
  }
  return r ; // Return the final modular product.
}


// Variables for precomputed factorials and inverse factorials.
var facn = 1 , finv = [ ] ;


/*
 * Function 'fset' precomputes factorials and inverse factorials up to 'n' modulo 'mod'.
 * It uses a hybrid approach for efficiency based on the size of 'n'.
 */
function fset ( n ) {
  // For smaller 'n', direct computation is faster.
  if ( n < 8e6 ) {
    for ( var i = 2 ; i <= n ; i ++ ) {
      facn = facn * i % mod ;
    }
  }
  // For larger 'n', it uses a precomputed value for 8 million and then multiplies incrementally.
  else {
    facn = 833655840 ; // Precomputed factorial for 8,000,000 mod 998244353.
    for ( var i = 8000001 ; i <= n ; i ++ ) {
      facn = mul ( facn , i ) ;
    }
  }

  finv . length = n + 1 ; // Set the length of the inverse factorial array.
  finv [ 0 ] = finv [ 1 ] = 1 ; // Base cases for inverse factorials.
  finv [ n ] = inv ( facn ) ; // Compute inverse of facn using modular inverse function.

  // Compute inverse factorials downwards using the relation: inv(i-1) = inv(i) * i.
  for ( i = n ; 2 < i ; ) {
    finv [ i - 1 ] = mul ( finv [ i ] , i -- ) ;
  }
}


/*
 * Function 'inv' computes the modular multiplicative inverse of 'a' modulo 'mod'
 * using the Extended Euclidean Algorithm.
 */
function inv ( a ) {
  var b = mod , // 'b' is the modulus.
      u = 1 ,   // Coefficient for 'a'.
      v = 0 ,   // Coefficient for 'b'.
      t ;       // Temporary variable for swapping.

  while ( b ) {
    t = a / b | 0 ; // Integer division.
    a -= t * b ;    // Update 'a'.
    u -= t * v ;    // Update 'u'.
    t = a ;         // Swap 'a' and 'b'.
    a = b ;
    b = t ;
    t = u ;         // Swap 'u' and 'v'.
    u = v ;
    v = t ;
  }

  u %= mod ; // Ensure 'u' is within the modulo range.
  return u < 0 ? u + mod : u ; // Adjust negative results.
}


/*
 * Function 'pow' computes (a^n) % mod using binary exponentiation (exponentiation by squaring).
 */
function pow ( a , n ) {
  var r = 1 ; // Initialize result to 1.
  for ( ; n ; a = mul ( a , a ) , n >>= 1 ) { // Loop while 'n' is not zero.
    if ( n & 1 ) { // If the last bit of 'n' is 1.
      r = mul ( a , r ) ; // Multiply result by 'a'.
    }
  }
  return r ; // Return the final modular power.
}


/*
 * Function 'ncr' computes "n choose r" (binomial coefficient) modulo 'mod'.
 * It uses precomputed factorials and inverse factorials.
 * nCr = n! / (r! * (n-r)!) = n! * (r!)^(-1) * ((n-r)!)^(-1)
 */
function ncr ( n , r ) {
  return mul ( facn , finv [ r ] , finv [ n - r ] ) ;
}


// Log the result of the main function to the console.
console . log ( main ( ) ) ;


/*
 * The main function that orchestrates the problem-solving logic.
 * It reads input 'n', calculates an initial answer, and then adjusts it
 * based on a specific formula involving combinations and powers of 2.
 */
function main ( ) {
  var n = o . a ( ) ; // Read the input integer 'n'.

  // Initial answer: 3^n mod mod.
  var ans = pow ( 3 , n ) ;

  fset ( n ) ; // Precompute factorials and inverse factorials up to 'n'.

  var p2 = 1 ; // Initialize power of 2.

  // Loop from n down to (n/2) + 1.
  for ( var i = n , m = n >> 1 ; m < i ; i -- ) {
    p2 += p2 ; // p2 = p2 * 2
    if ( mod <= p2 ) {
      p2 -= mod ; // Keep p2 within modulo range.
    }
    // Subtract nCr(n, i) * p2 from the answer.
    ans -= mul ( ncr ( n , i ) , p2 ) ;
  }

  ans %= mod ; // Ensure the final answer is within modulo range.
  return ans < 0 ? ans + mod : ans ; // Adjust negative results to be positive.
}