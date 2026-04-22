"use strict"; // This directive enables strict mode for the entire script, enforcing stricter parsing and error handling.

var input = require("fs") . readFileSync( "/dev/stdin", "utf8" ) ; // Synchronously reads the entire content from standard input ("/dev/stdin") as a UTF-8 encoded string.
var cin   = input . split( / |\n/ ) , // Splits the input string into an array of tokens, using either space or newline as delimiters.
    cid   = 0 ; // Initializes 'cid' (current input index) to 0, acting as a pointer for traversing the 'cin' array.

/**
 *  Retrieves the next token from the pre-parsed input array (`cin`).
 *
 *  @param {boolean} a - A flag. If true, the token is returned as a string.
 *                       If false or undefined, the token is converted to a number using the unary plus operator.
 *  @returns {string|number} The next token from the input stream.
 */
function next( a )
{
  return a
    ? cin[ cid++ ] // If 'a' is truthy, return the token as a string and then increment 'cid'.
    : +cin[ cid++ ] ; // If 'a' is falsy, convert the token to a number and then increment 'cid'.
}


/*
 *  Reads a specified number of tokens from the input array (`cin`).
 *
 *  @param {number} n - The count of tokens to read.
 *  @param {boolean} a - A flag. If true, tokens are returned as strings.
 *                       Otherwise, tokens are converted to numbers.
 *  @returns {Array<string|number>} An array containing the 'n' read tokens.
 */
function nexts ( n , a )
{
  return a
    ? cin . slice( cid , cid += n ) // If 'a' is truthy, extract 'n' tokens as strings and advance 'cid'.
    : cin . slice( cid , cid += n ) . map( a => +a ) ; // If 'a' is falsy, extract 'n' tokens, convert each to a number, and advance 'cid'.
}


//  Function designed to read a 2D matrix (a 2D array) of values from the input.
function nextm( h , w , a )
{
  var r = [] , // Initialize an empty array to store the rows of the matrix.
      i = 0 ; // Initialize a loop counter.

  if ( a ) { // If 'a' is truthy, read elements as strings.
    for ( ; i < h ; i++ )
      r . push( cin . slice( cid , cid += w ) ) ; // Read 'w' string tokens for the current row and add to 'r'.
  }
  else { // Otherwise (if 'a' is falsy), read elements as numbers.
    for ( ; i < h ; i++ )
      r . push( cin . slice( cid , cid += w ) . map( a => +a ) ) ; // Read 'w' tokens, convert to numbers, and add to 'r'.
  }
  return r ; // Return the fully constructed matrix.
}


/*
 *  Dynamically constructs a multi-dimensional array initialized with a specific value.
 *  The dimensions of the array are passed as subsequent arguments after the initial value.
 */
function xArray( v )
{
  var a = arguments , // Access the 'arguments' object to get all parameters.
      l = a . length , // Get the total number of arguments.
      r = "Array(a[" + --l + "]) . fill() . map(x=>{return " + v + ";})" ; // Constructs the string for the innermost array.

  while ( --l ) // Loop to build the string for outer array dimensions.
    r = "Array(a[" + l + "]) . fill() . map(x=>" + r + ")" ; // Nests the array creation strings.

  return eval( r ) ; // Executes the dynamically generated string as JavaScript code to create the array.
}


/*
 *  --- BEGIN 64-bit Integer Arithmetic Utility Functions ---
 *  These functions provide basic arithmetic operations for 64-bit integers,
 *  simulated using two 32-bit integers: [low_part, high_part].
 */

/**
 *  Multiplies two 32-bit integers, returning a 64-bit product.
 *
 *  @param {number} a - The first 32-bit integer operand.
 *  @param {number} b - The second 32-bit integer operand.
 *  @returns {Array<number>} A 2-element array [low, high] representing the 64-bit product.
 */
function mul( a , b )
{
  var ah = a >> 16 , // Extracts the high 16 bits of 'a'.
      al = a & 0xffff ; // Extracts the low 16 bits of 'a'.

  var h  = ah * b , // Calculates a partial product (high part of a * b).
      l  = al * b ; // Calculates another partial product (low part of a * b).

  l += 0x10000 * ( h & 0xffff ) ; // Adds the carry from the low 16 bits of 'h' to 'l'.
  h = Math . floor( h / 0x10000 ) ; // Shifts 'h' right by 16 bits, discarding its low 16 bits.

  h += Math . floor( l / 0x100000000 ) ; // Adds any carry from 'l' (if it exceeded 2^32) to 'h'.

  return [ l >>> 0 , h ] ; // Returns the 64-bit result, ensuring 'l' is treated as unsigned 32-bit.
}


/**
 *  Adds two 64-bit numbers.
 *
 *  @param {Array<number>} a - The first 64-bit number, represented as [low, high].
 *  @param {Array<number>} b - The second 64-bit number, represented as [low, high].
 *  @returns {Array<number>} The sum, also represented as [low, high].
 */
function add( a , b )
{
  var l = a[0] + b[0] , // Sums the low 32-bit parts.
      h = a[1] + b[1] ; // Sums the high 32-bit parts.

  if ( l > 0xffffffff ) { // Checks if there's a carry from the low part (if it exceeds 2^32 - 1).
    h++ ; // Increments the high part due to the carry.
    l -= 0x100000000 ; // Adjusts the low part by subtracting 2^32.
  }
  return [ l , h >> 0 ] ; // Returns the sum, ensuring the high part is a signed 32-bit integer.
}


/**
 *  Subtracts one 64-bit number from another.
 *
 *  @param {Array<number>} a - The minuend (the number from which to subtract), represented as [low, high].
 *  @param {Array<number>} b - The subtrahend (the number to subtract), represented as [low, high].
 *  @returns {Array<number>} The difference, also represented as [low, high].
 */
function minus( a , b )
{
  var l = a[0] - b[0] , // Subtracts the low 32-bit parts.
      h = a[1] - b[1] ; // Subtracts the high 32-bit parts.

  if ( l < 0 ) { // Checks if there's a borrow from the high part (if low part became negative).
    h-- ; // Decrements the high part due to the borrow.
    l += 0x100000000 ; // Adjusts the low part by adding 2^32.
  }
  return [ l , h >> 0 ] ; // Returns the difference, ensuring the high part is a signed 32-bit integer.
}


/**
 *  Divides a 64-bit number by 2 (equivalent to a right bit shift).
 *
 *  @param {Array<number>} a - The 64-bit number [low, high] to be halved.
 *  @returns {Array<number>} The result of the division by 2, also as [low, high].
 */
function half( a )
{
  return [
    ( a[0] >>> 1 ) + ( ( a[1] & 1 ) ? 0x80000000 : 0 ) , // Shifts the low part right by 1, and adds 2^31 if the high part's LSB was 1 (carry).
    a[1] >> 1 // Shifts the high part right by 1, preserving its sign.
  ] ;
}


/**
 *  Compares two 64-bit numbers.
 *
 *  @param {Array<number>} a - The first 64-bit number [low, high].
 *  @param {Array<number>} b - The second 64-bit number [low, high].
 *  @returns {number} Returns 1 if a > b, -1 if a < b, and 0 if a == b.
 */
function compare( a , b )
{
  if ( a[1] > b[1] ) return 1 ; // First, compare the high 32-bit parts.
  if ( a[1] < b[1] ) return -1 ;
  if ( a[0] > b[0] ) return 1 ; // If high parts are equal, then compare the low 32-bit parts.
  if ( a[0] < b[0] ) return -1 ;
  return 0 ; // If both high and low parts are equal, the numbers are identical.
}


/**
 *  Converts a 64-bit number (represented as [low, high]) into its decimal string representation.
 *
 *  @param {Array<number>} a - The 64-bit number [low, high].
 *  @returns {string} The decimal string representation of the number.
 */
function toString( a )
{
  var neg = 0 ; // A flag to indicate if the original number was negative.

  // Handle negative numbers: convert to positive for calculation, then prepend sign.
  if ( a[1] < 0 ) {
    neg = 1 ; // Set the negative flag.
    a[1] = -a[1] ; // Make the high part positive.
    if ( a[0] ) { // If the low part is non-zero, adjust it and borrow from the high part.
      a[0] = 0x100000000 - a[0] ; // Invert low part (two's complement for 32-bit).
      a[1]-- ; // Decrement high part due to borrow.
    }
  }

  // Constants used for base 10^5 conversion (approximating 2^32 / 100000).
  var ih = 42949 , // Integer part of 2^32 / 10^5 / (2^16) roughly.
      il = 67296 ; // Integer part of 2^32 / 10^5 roughly.

  // Perform division by 100000 to get parts in base 10^5.
  var al = a[1] * il + a[0] , // Calculate the approximate low part in base 10^5.
      ah = a[1] * ih + Math . floor( al / 100000 ) ; // Calculate the approximate high part in base 10^5, considering carry from 'al'.
  al %= 100000 ; // Get the remainder for the actual low part in base 10^5.

  var res = "" ; // Initialize the result string.
  if ( ah === 0 ) { // If the high part in base 10^5 is zero, only the low part needs to be appended.
    res += al ;
  }
  else { // Otherwise, format the low part with leading zeros and concatenate with the high part.
    al = ( "00000" + al ) . slice( -5 ) ; // Pad 'al' with leading zeros to ensure 5 digits.
    res = ah + al ; // Concatenate the high and formatted low parts.
  }

  // If the original number was negative and not zero, prepend a minus sign.
  if ( neg && res !== "0" ) {
    res = "-" + res ;
  }
  return res ; // Return the final decimal string.
}

/*
 *  --- END 64-bit Integer Arithmetic Utility Functions ---
 */


//  Global variables used for storing and categorizing input numbers for the problem.
var zero = 0 , // Counter for numbers that are exactly zero.
    neg  = [] , // Array to store all negative numbers encountered.
    pos  = [] ; // Array to store all positive numbers encountered.

var nsize , // Will store the number of elements in the 'neg' array (size of negative numbers).
    psize ; // Will store the number of elements in the 'pos' array (size of positive numbers).


//  Executes the main problem-solving function and prints its return value to the console if it's not undefined.
var myOut = main() ;
if ( myOut !== undefined ) {
  console . log( myOut ) ;
}


/**
 *  The main entry point for solving the problem.
 *  It reads N and K, categorizes the input numbers, and then determines
 *  the K-th smallest product based on the counts of negative, zero, and positive products.
 *
 *  @returns {string|number} The K-th smallest product as a string, or 0 if it's a zero product.
 */
function main()
{
  var n = next() , // Reads the total count of numbers (N) from input.
      k = next() ; // Reads the target rank (K) for the smallest product from input.

  // Loop 'n' times to read and categorize each input number.
  for ( var i = 0 ; i < n ; i++ )
  {
    var a = next() ; // Read the current number.
    if ( a === 0 ) {
      zero++ ; // If the number is 0, increment the 'zero' counter.
    }
    else if ( a < 0 ) {
      neg . push( a ) ; // If the number is negative, add it to the 'neg' array.
    }
    else {
      pos . push( a ) ; // If the number is positive, add it to the 'pos' array.
    }
  }

  nsize = neg . length ; // Update 'nsize' with the actual count of negative numbers.
  psize = pos . length ; // Update 'psize' with the actual count of positive numbers.

  neg . sort( ( a , b ) => a - b ) ; // Sort the negative numbers in ascending order (e.g., -10, -5, -1).
  pos . sort( ( a , b ) => a - b ) ; // Sort the positive numbers in ascending order (e.g., 1, 5, 10).

  // Calculate 'u', the total count of products that are negative (i.e., a negative number multiplied by a positive number).
  var u = nsize * psize ;

  // Check if the K-th smallest product falls within the range of negative products.
  if ( k <= u ) {
    return negsolve( k ) ; // If so, call 'negsolve' to find the K-th negative product.
  }

  // If K is greater than the count of negative products, calculate the count of zero products.
  // The formula (2*n - zero - 1) * zero / 2 counts unique pairs involving at least one zero.
  u += ( ( 2 * n - zero - 1 ) * zero ) / 2 ;

  // Check if the K-th smallest product falls within the range of zero products.
  if ( k <= u ) {
    return 0 ; // If so, the K-th product is 0.
  }

  // If K is greater than the combined count of negative and zero products, it must be a positive product.
  return possolve( k - u ) ; // Call 'possolve' to find the K-th positive product, adjusting 'K' by subtracting the count of smaller products.
}


/**
 *  Finds the K-th smallest negative product using a binary search approach.
 *  This function assumes that 'k' is within the range of possible negative products.
 *
 *  @param {number} k - The target rank (1-indexed) among only the negative products.
 *  @returns {string} The K-th smallest negative product as its string representation.
 */
function negsolve( k )
{
  // Initialize the binary search range for the product.
  // 'ok' (potential answer) is initialized to a large negative value (e.g., -1).
  // 'ng' (not good, too small) is initialized to an even smaller negative value (e.g., -1e18).
  var ok = [ 0xffffffff , -1 ] , // Represents -1 (0xFFFFFFFF_FFFFFFFF if viewed as signed 64-bit).
      ng = add( ok , mul( -1e9 , 1e9 ) ) ; // Represents -1e18, a number guaranteed to be smaller than any product.

  // The binary search loop continues as long as the difference between 'ok' and 'ng' is greater than 1.
  while ( compare( minus( ok , ng ) , [ 1 , 0 ] ) === 1 )
  {
    var m   = half( add( ok , ng ) ) , // Calculates the midpoint 'm' of the current search interval.
        cnt = 0 , // Counter for products that are less than or equal to 'm'.
        l   = 0 ; // Pointer used to iterate through the 'neg' array.

    // Iterate through the positive numbers ('pos' array).
    for ( var i = 0 ; i < psize && cnt < k ; i++ )
    {
      // For each 'pos[i]', count how many 'neg[l]' values result in a product (neg[l] * pos[i]) that is <= 'm'.
      // Since 'neg' is sorted ascending (e.g., [-10, -5, -2]), and 'm' is negative,
      // the product 'neg[l] * pos[i]' becomes more negative (smaller) as 'l' increases.
      while ( l < nsize && compare( mul( neg[l] , pos[i] ) , m ) <= 0 ) {
        l++ ; // Increment 'l' as long as the product satisfies the condition.
      }
      cnt += l ; // All 'l' elements from 'neg[0]' to 'neg[l-1]' satisfy the condition for the current 'pos[i]'.
    }

    // Adjust the binary search range based on the 'cnt' value.
    if ( k <= cnt ) {
      ok = m ; // If 'k' is less than or equal to 'cnt', 'm' could be the answer or too large; try a smaller 'ok'.
    } else {
      ng = m ; // If 'k' is greater than 'cnt', 'm' is too small; try a larger 'ng'.
    }
  }
  return toString( ok ) ; // Convert the final 64-bit result 'ok' to its string representation.
}


/**
 *  Finds the K-th smallest positive product using a binary search approach.
 *  This function assumes that 'k' is within the range of possible positive products.
 *
 *  @param {number} k - The target rank (1-indexed) among only the positive products.
 *  @returns {string} The K-th smallest positive product as its string representation.
 */
function possolve( k )
{
  neg . reverse() ; // Reverse the 'neg' array. It was sorted ascending; now it's descending (e.g., [-1, -2, -5]).
                    // This helps in counting products of two negative numbers efficiently.

  // Initialize the binary search range for the product.
  // 'ok' (potential answer) is initialized to a large positive value (e.g., 1e18).
  // 'ng' (not good, too small) is initialized to 0.
  var ok = mul( 1e9 , 1e9 ) , // Represents 1e18, a value larger than any possible product.
      ng = [ 0 , 0 ] ; // Represents 0.

  // The binary search loop continues as long as the difference between 'ok' and 'ng' is greater than 1.
  while ( compare( minus( ok , ng ) , [ 1 , 0 ] ) === 1 )
  {
    var m   = half( add( ok , ng ) ) , // Calculates the midpoint 'm' of the current search interval.
        cnt = 0 ; // Counter for products that are less than or equal to 'm'.

    // --- Count products from two positive numbers (pos[i] * pos[j]) <= m ---
    // 'pos' array is sorted ascending (e.g., [1, 2, 5]).
    for ( var i = 0 , l = psize - 1 ; i < psize && cnt < k ; i++ )
    {
      // For a fixed 'pos[i]', find how many 'pos[l]' values result in 'pos[l] * pos[i]' <= 'm'.
      // As 'l' decreases from 'psize - 1', 'pos[l] * pos[i]' also decreases.
      while ( l > i && compare( mul( pos[l] , pos[i] ) , m ) > 0 ) {
        l-- ; // Decrement 'l' as long as the product is greater than 'm'.
      }
      if ( l <= i ) break ; // If 'l' crosses or equals 'i', no more unique pairs for this 'i'.
      cnt += l - i ; // Add the count of valid pairs (i, i+1) through (i, l).
    }

    // --- Count products from two negative numbers (neg[i] * neg[j]) <= m ---
    // 'neg' array is now sorted descending (e.g., [-1, -2, -5]).
    // The product 'neg[i] * neg[j]' is positive. As 'l' decreases, 'neg[l]' becomes more negative,
    // and thus 'neg[l] * neg[i]' (which is positive) becomes larger.
    for ( var i = 0 , l = nsize - 1 ; i < nsize && cnt < k ; i++ )
    {
      // For a fixed 'neg[i]', find how many 'neg[l]' values result in 'neg[l] * neg[i]' <= 'm'.
      while ( l > i && compare( mul( neg[l] , neg[i] ) , m ) > 0 ) {
        l-- ; // Decrement 'l' as long as the product is greater than 'm'.
      }
      if ( l <= i ) break ; // If 'l' crosses or equals 'i', no more unique pairs for this 'i'.
      cnt += l - i ; // Add the count of valid pairs (i, i+1) through (i, l).
    }

    // Adjust the binary search range based on the 'cnt' value.
    if ( k <= cnt ) {
      ok = m ; // If 'k' is less than or equal to 'cnt', 'm' could be the answer or too large; try a smaller 'ok'.
    } else {
      ng = m ; // If 'k' is greater than 'cnt', 'm' is too small; try a larger 'ng'.
    }
  }
  return toString( ok ) ; // Convert the final 64-bit result 'ok' to its string representation.
}