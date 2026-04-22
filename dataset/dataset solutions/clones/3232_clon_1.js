"use    strict"
// This is the beginning of the JavaScript code.

/**
 * The Main function processes the input string to calculate a specific value.
 * @param {string} input - The raw input string containing numbers and whitespace.
 */
function Main ( input ) {
  // Initialize an array to store parsed numbers and a counter.
  var I = [ ] , i = 0 ;
  // Regular expression to match a sequence of digits (numbers).
  var checkNum = /^\d+/ ;
  // Regular expression to match a space or a newline character.
  var checkSpace = / |\n/ ;


  // Loop while there is still input to process.
  while ( input . length > 0 ) {
    // Check if the input starts with a number.
    if ( input . match ( checkNum ) ) {
      // If a number is found, extract it and store it in array I.
      I [ i ] = input . match ( checkNum ) [ 0 ] ;
      // Remove the extracted number from the input string.
      input = input . replace ( checkNum , "" ) ;
      // Increment the counter for the array I.
      i ++ ;
      // Continue to the next iteration of the loop.
      continue ;
    }
    // If no number is found at the beginning, remove any leading space or newline.
    input = input . replace ( checkSpace , "" ) ;
    // Continue to the next iteration.
    continue ;
  }


  // After parsing, set the input variable to the array of numbers.
  input = I ;
  // Parse the first number from input as N.
  var N = parseInt ( input [ 0 ] ) ;
  // Parse the second number from input as K, then convert it to its binary string representation.
  var K = parseInt ( input [ 1 ] ) . toString ( 2 ) ;


  // Pad K with leading zeros until its length is 50.
  while ( K . length < 50 ) {
    K = "0" + K ;
  }


  // Remove the first two elements (N and K) from the input array.
  input . shift ( ) ;
  input . shift ( ) ;


  // Initialize an array A to store binary representations of the remaining numbers.
  var A = [ ] ;
  // Loop through the remaining numbers in input.
  for ( let i = 0 ; i < N ; i ++ ) {
    // Parse each number and convert it to its binary string representation.
    A [ i ] = parseInt ( input [ i ] ) . toString ( 2 ) ;
    // Pad the binary string with leading zeros until its length is 50.
    while ( A [ i ] . length < 50 ) {
      A [ i ] = "0" + A [ i ] ;
    }
  }


  // Initialize an array to store the sum of digits at each position.
  var digSum = [ ] ;
  // Loop 50 times, for each binary digit position.
  for ( let i = 0 ; i < 50 ; i ++ ) {
    digSum [ i ] = 0 ; // Initialize sum for current position.
    // Loop through each binary number in array A.
    for ( let j = 0 ; j < N ; j ++ ) {
      // Add 1 to digSum if the digit at position i is '1', otherwise add 0.
      digSum [ i ] += ( A [ j ] [ i ] === "1" ) ? 1 : 0 ;
    }
  }


  // Initialize counterMax to store the maximum calculated value.
  var counterMax = 0 ;
  // Calculate L by parsing K as a binary number and adding 1.
  var L = parseInt ( K , 2 ) + 1 ;
  // Convert L to its binary string representation M.
  var M = L . toString ( 2 ) ;
  // Initialize arrays and counters for finding '1's in M.
  var a = [ 0 , ] , b = 0 , i = 0 ;
  // Find all indices of '1's in M.
  while ( b !== -1 ) {
    b = M . indexOf ( "1" , b + 1 ) ;
    a [ i ] = b ;
    i ++ ;
  }
  // Remove the last element which is -1 (from indexOf not finding more '1's).
  a . pop ( ) ;
  // Iterate through each '1' position found in M.
  for ( let k = 0 ; k < a . length ; k ++ ) {
    var counter = 0 ; // Initialize counter for current iteration.
    var X = [ ] ; // Initialize an array to build a new binary string X.
    // Copy digits from M up to the current '1' position (a[k]).
    for ( let l = 0 ; l < a [ k ] ; l ++ ) {
      X [ l ] = M [ l ] ;
    }
    // Set the digit at the current '1' position (a[k]) to '0'.
    X [ a [ k ] ] = "0" ;
    // For digits after a[k], choose '1' if (2 * digSum[l] < N), else '0'.
    for ( let l = a [ k ] + 1 ; l < M . length ; l ++ ) {
      X [ l ] = ( 2 * digSum [ l ] < N ) ? 1 : 0 ;
    }
    // Join the array X into a single binary string.
    X = X . join ( "" ) ;
    // Pad X with leading zeros until its length is 50.
    while ( X . length < 50 ) {
      X = "0" + X ;
    }
    // Calculate the value based on X and digSum, using powers of 2.
    // Loop through 50 binary digits.
    for ( let i = 0 ; i < 50 ; i ++ ) { // Traverse 50 bits from most significant to least significant.
        counter += ( ( X [ i ] === "0" ) ? digSum [ i ] : N - digSum [ i ] ) * Math . pow ( 2 , 49 - i ) ;
    }
    // Update counterMax with the maximum value found so far.
    counterMax = Math . max ( counterMax , counter ) ;
  }
  // Print the final maximum counter value to the console.
  console . log ( counterMax ) ;
}

// Call the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;