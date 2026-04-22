/*
 * This function is designed to prepend zeros to a number string
 * until it reaches a specified length 'n'.
 * If the number string is already 'n' characters long or longer,
 * it will be truncated from the left to 'n' characters.
 *
 * @param {string} numStr The number as a string.
 * @param {number} n The desired final length of the string.
 * @returns {string} The zero-padded or truncated string.
 */
function zeroPadding ( numStr , n ) {
                                  // Initialize an empty string to store the zeros.
  var zeros = '' ;

  /*
   * Loop 'n' times to build a string consisting of 'n' zeros.
   * This string will then be used for padding.
   */
  for ( var k = 0 ; k < n ; k ++ ) {
    zeros = zeros + '0' ;         // Append a '0' in each iteration.
  }

  // Concatenate the generated zeros with the original number string.
  // Then, slice the result from the end to ensure its length is exactly 'n'.
  return ( zeros + numStr ) . slice ( - n ) ;
}


/*
 * This function calculates the frequency of sums of subsets.
 * Given an array 'arr', it considers all 2^N possible subsets
 * and sums their elements. It then counts how many times each sum occurs.
 *
 * @param {number[]} arr The input array of numbers.
 * @returns {number[]} An array where the index represents a sum
 *                     and the value at that index is its frequency.
 */
function Inverse ( arr ) {
  var N = arr . length ;          // Get the length of the input array.
  var M = Math . pow ( 2 , N ) ;  // Calculate 2^N, the total number of subsets.

  var returnArray = [ ] ;         // Initialize an array to store frequencies.

  /*
   * Initialize the frequency array with zeros.
   * The maximum possible sum is assumed to be less than 2501 based on problem constraints.
   */
  for ( var k = 0 ; k < 2501 ; k ++ ) {
    returnArray [ k ] = 0 ;       // Set initial frequency for each sum to zero.
  }

  /*
   * Iterate through all possible combinations from 0 to M-1.
   * Each integer 'i' represents a subset when converted to binary.
   * A '1' at a position indicates inclusion of the element from 'arr'.
   */
  for ( var i = 0 ; i < M ; i ++ ) {
                                  // Convert 'i' to binary string, padded to 'N' bits.
    var b = zeroPadding ( ( i . toString ( 2 ) ) , N ) ;
    var index = 0 ;               // Initialize sum for the current subset.

    /*
     * Iterate through the binary representation of 'i'.
     * If the j-th bit is '1', add arr[j] to the current subset's sum.
     */
    for ( var j = 0 ; j < N ; j ++ ) {
      index += ( b [ j ] === '1' ) ? arr [ j ] : 0 ;
    }
    returnArray [ index ] ++ ;    // Increment the frequency for the calculated sum.
  }

  return returnArray ;            // Return the array of sum frequencies.
}


/*
 * The main function to process the input, perform calculations, and output the result.
 * It reads numbers, categorizes them, calculates subset sums, and finds a specific count.
 *
 * @param {string} input The raw input string, typically from stdin.
 */
function main ( input ) {
  var counter = 0 ;               // Initialize a counter for the final result.

  var Lines = input . split ( '\n' ) ; // Split the input string into an array of lines.

  // Parse the first two lines, splitting them by space.
  Lines [ 0 ] = Lines [ 0 ] . split ( ' ' ) ;
  Lines [ 1 ] = Lines [ 1 ] . split ( ' ' ) ;

  var N = parseInt ( Lines [ 0 ] [ 0 ] ) ; // Get N from the first line.
  var A = parseInt ( Lines [ 0 ] [ 1 ] ) ; // Get A from the first line.

  var x = Lines [ 1 ] ;                   // Get the array of numbers from the second line.

  var xPlus , xMinus , xZero ;            // Declare variables for categorized numbers.

  /*
   * Adjust each number in array 'x' by subtracting 'A'.
   * This transforms the problem from finding sums equal to 'A'
   * to finding sums equal to '0' (after adjustment).
   */
  for ( var l = 0 ; l < N ; l ++ ) {
    x [ l ] = parseInt ( x [ l ] ) - A ;
  }

  // Filter the adjusted numbers into three categories: positive, negative, and zero.
  xPlus = x . filter ( function ( num ) { return num > 0 ; } ) ;
  xMinus = x . filter ( function ( num ) { return num < 0 ; } ) ;

  // Calculate the count of zeros in the adjusted array.
  xZero = x . length - xPlus . length - xMinus . length ;

  // Calculate the number of choices involving zeros (2^xZero).
  var zeroChoice = Math . pow ( 2 , xZero ) ;

  /*
   * For the negative numbers, convert them to their positive counterparts.
   * This is done to use the 'Inverse' function consistently, as it operates on positive values
   * (indices of frequency array are positive).
   */
  for ( var hoge = 0 ; hoge < xMinus . length ; hoge ++ ) {
    xMinus [ hoge ] = - xMinus [ hoge ] ;
  }

  // Calculate frequency arrays for positive numbers (A) and absolute negative numbers (B).
  A = Inverse ( xPlus ) ;
  B = Inverse ( xMinus ) ;

  /*
   * Iterate through possible sums (from 1 to 2500).
   * For each sum 'o', multiply the frequency of 'o' from xPlus subsets
   * by the frequency of 'o' from xMinus subsets.
   * This counts pairs of subsets (one from xPlus, one from xMinus)
   * that sum to 0 (because -o + o = 0).
   */
  for ( var o = 1 ; o < 2501 ; o ++ ) {
      counter += A [ o ] * B [ o ] ;
  }

  /*
   * The final calculation:
   * (counter + 1): Accounts for the empty set combination that sums to zero.
   * (zeroChoice + 1): Accounts for the empty set and all combinations of zeros.
   * -1: Subtracts the case where all subsets (from xPlus, xMinus, and xZero) are empty,
   *     which doesn't count as a valid selection in some interpretations of "summing to A".
   *     This typically means we want at least one element selected.
   */
  console . log ( ( counter + 1 ) * ( zeroChoice + 1 ) - 1 ) ;
}


// Read input from standard input, decode as UTF-8, and pass to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'UTF-8' ) ) ;