"use strict"
; /* This script operates in strict mode to catch common coding errors. */


// Module import for file system operations.
// Reads the entire content of standard input synchronously.
var   input
  =
    require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
;

// Initializes an array 'cin' by splitting the input string
// by spaces or newlines, and 'cid' as a cursor for 'cin'.
var   cin = input . split ( / |
| \n / )
  , cid = 0
;


/*
 * Function: next()
 * Retrieves the next token from the 'cin' array and
 * converts it into a numeric type.
 */
function next ( )
{
  return + cin [ cid ++ ] ;
}


/*
 * Function: nextstr()
 * Retrieves the next token from 'cin' as a raw string.
 */
function nextstr ( )
{
  return cin [ cid ++ ] ;
}


/*
 * Function: nextbig()
 * Retrieves the next token from 'cin' and
 * converts it into a BigInt type.
 */
function nextbig ( )
{
  return BigInt ( cin [ cid ++ ] ) ;
}


/*
 * Function: nexts(n, a)
 * Reads 'n' consecutive tokens from 'cin'.
 * If 'a' is truthy, returns them as an array of strings.
 * Otherwise, returns them as an array of numbers.
 */
function nexts ( n , a )
{
  return a
    ? cin . slice ( cid , cid += n )
    : cin . slice ( cid , cid += n ) . map ( a => + a )
  ;
}


/*
 * Function: nextm(h, w, a)
 * Reads a 2D matrix of dimensions h x w.
 * 'h' is the number of rows, 'w' is the number of columns.
 * If 'a' is truthy, elements are strings. Otherwise, they are numbers.
 */
function nextm ( h , w , a )
{
  var   r = [ ]
    , i = 0
  ;

  if ( a )
  {
    for ( ; i < h ; i ++ )
    {
      r . push ( cin . slice ( cid , cid += w ) ) ;
    }
  }
  else
  {
    for ( ; i < h ; i ++ )
    {
      r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
    }
  }

  return r ;
}


/*
 * Function: xArray(v)
 * Creates a multi-dimensional array dynamically.
 * The dimensions are passed as subsequent arguments.
 * Each element is initialized with the value 'v'.
 */
function xArray ( v )
{
  var   a = arguments
    , l = a . length
    , r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})"
  ;

  while ( -- l )
  {
    r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
  }

  return eval ( r ) ;
}


// --- Mathematical Helper Functions ---


/*
 * Function: gcd(a, b)
 * Computes the Greatest Common Divisor of two numbers using
 * the Euclidean algorithm.
 */
function gcd ( a , b )
{
  return b
    ? gcd ( b , a % b )
    : a
  ;
}


// Defines a modulo constant, commonly used in modular arithmetic.
var mod = 1e9 + 7 ;


/*
 * Function: mul()
 * Multiplies an arbitrary number of arguments together,
 * applying modulo 'mod' at each step to prevent overflow.
 * Uses a specific bitwise multiplication trick for efficiency.
 */
function mul ( )
{
  for (
    var   a = arguments
      , r = a [ 0 ]
      , i = a . length
    ;
    -- i
    ;
  )
  {
    r = ( ( r >> 16 ) * a [ i ] % mod * 65536 + ( r & 65535 ) * a [ i ] ) % mod ;
  }

  return r ;
}


/*
 * Function: pow(a, n)
 * Computes 'a' raised to the power 'n' modulo 'mod'.
 * Implements binary exponentiation (exponentiation by squaring) for speed.
 */
function pow ( a , n )
{
  for (
    var   r = 1
    ;
    n
    ;
    a = mul ( a , a ) , n >>= 1
  )
  {
    if ( n & 1 )
    {
      r = mul ( a , r ) ;
    }
  }

  return r ;
}


/*
 * Function: mput(n)
 * Ensures that the given number 'n' is always positive and
 * within the range [0, mod-1] after modulo operation.
 */
function mput ( n )
{
  return ( ( n % mod ) + mod ) % mod ;
}


// --- Main Execution Block ---


// Calls the main logic function and stores its return value.
var myOut = main ( ) ;

// If the main function returns a value (i.e., not undefined),
// it is printed to the console.
if ( myOut !== undefined )
{
  console . log ( myOut ) ;
}


/*
 * Function: main()
 * Contains the primary algorithm for processing input data,
 * performing calculations, and determining the final result.
 */
function main ( )
{
  // Reads the total number of data pairs to process.
  var   n = next ( ) ;

  // Counters for specific types of zero values encountered.
  var   az = 0
    , bz = 0
    , z = 0
  ;

  // 'map' stores unique normalized pairs and their counts.
  // 'ar' stores the unique normalized pairs in sequence.
  var   map = { }
    , ar = [ ]
  ;

  // Iterates 'n' times to read and process each pair of BigInts.
  for ( var i = 0 ; i < n ; i ++ )
  {
    var   a = nextbig ( )
      , b = nextbig ( )
    ;

    // Special handling for cases where 'a' or 'b' (or both) are zero.
    if ( a === 0n && b === 0n )
    {
      z ++ ; // Both are zero.
      continue ;
    }

    if ( a === 0n )
    {
      az ++ ; // Only 'a' is zero.
      continue ;
    }

    if ( b === 0n )
    {
      bz ++ ; // Only 'b' is zero.
      continue ;
    }

    // Calculate the GCD to simplify the pair (a, b) to its lowest terms.
    var   c = gcd ( a , b ) ;

    a /= c ; // Divide 'a' by GCD.
    b /= c ; // Divide 'b' by GCD.

    // Normalize the pair: ensure 'a' is always non-negative.
    // If 'a' is negative, flip signs of both 'a' and 'b'.
    if ( a < 0 )
    {
      a = - a ;
      b = - b ;
    }

    // Store and count the normalized pair in the 'map'.
    if ( map [ a ] )
    {
      // If 'a' is already a key in 'map'.
      if ( map [ a ] [ b ] )
      {
        // If the pair (a, b) exists, double its count.
        map [ a ] [ b ] *= 2 ;
        // Keep the count within modulo range.
        if ( map [ a ] [ b ] >= mod )
        {
          map [ a ] [ b ] -= mod ;
        }
      }
      else
      {
        // If (a, b) is a new pair for this 'a', initialize count and add to 'ar'.
        map [ a ] [ b ] = 2 ;
        ar . push ( a , b ) ;
      }
    }
    else
    {
      // If 'a' is a new key, create its sub-map and add the pair.
      map [ a ] = { } ;
      map [ a ] [ b ] = 2 ;
      ar . push ( a , b ) ;
    }
  }

  // Calculate the initial answer based on counts of zero-containing pairs.
  var   ans = pow ( 2 , az ) + pow ( 2 , bz ) - 1 ;

  // Iterate through the collected unique normalized pairs in 'ar'.
  for ( var k = 0 ; k < ar . length ; k += 2 )
  {
    var   i = ar [ k ]
      , j = ar [ k + 1 ]
    ;

    var   t = 0 ; // Temporary variable for calculation.

    // Check for complementary pairs (specifically, (j, -i) for (i, j)).
    if ( j < 0 )
    {
      // If 'j' is negative, check for (-j, i).
      if ( map [ - j ] && map [ - j ] [ i ] )
      {
        continue ; // If found, this pair is already handled by its complement.
      }
    }
    else
    {
      // If 'j' is non-negative, check for (j, -i).
      if ( map [ j ] && map [ j ] [ - i ] )
      {
        t = map [ j ] [ - i ] - 1 ; // Adjust 't' based on its complement.
      }
    }

    // Add the count of the current pair (i, j) to 't'.
    t += map [ i ] [ j ] ;

    // Multiply the running answer 'ans' by 't', applying modulo.
    ans = mul ( ans , mod <= t ? t - mod : t ) ;
  }

  // Final calculation and modulo adjustment before returning.
  return mput ( ans - 1 + z ) ;
}