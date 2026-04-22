/*
 * This JavaScript file processes input data to determine card game hands.
 * It's structured as an Immediately Invoked Function Expression (IIFE)
 * to encapsulate its scope and prevent global variable pollution.
 * The input is read from standard input, parsed, and then each line
 * is processed individually.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

( function ( input ) {
  // Declare and initialize 'p' by processing the input string.
  // First, remove a trailing newline character if it exists.
  // Then, split the string into an array of lines.
  var p = input . replace ( /\n$/, '' ) . split ( '\n' ) ;


  // Store the number of lines (elements) in 'p' for loop iteration.
  var n = p . length ;

  // Loop through each line of the input.
  for ( var i = 0 ; i < n ; i ++ ) {

    // Process the current line:
    // 1. Remove the first element from 'p' (which is the current line).
    // 2. Split the line by commas.
    // 3. Convert each resulting string segment to a number.
    var a = p . shift ( ) . split ( ',' ) . map ( Number ) ;


    // Initialize an empty object 'r' to store the frequency of each number.
    var r = { } ;

    // Iterate through the array 'a' to count occurrences of each number.
    for ( var j = 0 ; j < a . length ; j ++ ) {

      // Check if the current number 'a[j]' is already a key in 'r'.
      if ( a [ j ] in r ) {

        // If it exists, increment its count.
        r [ a [ j ] ] ++ ;
      } else {

        // If it doesn't exist, initialize its count to 1.
        r [ a [ j ] ] = 1 ;
      }
    }


    // Initialize an empty array 'c' to group numbers by their frequencies.
    // 'c' will act like an array where indices are frequencies,
    // and values are arrays of numbers with that frequency.
    var c = [ ] ;

    // Iterate over the keys (numbers) in the frequency map 'r'.
    for ( var k in r ) {

      // Check if an array for the current frequency 'r[k]' already exists in 'c'.
      if ( r [ k ] in c ) {

        // If it exists, push the current number 'k' into that array.
        c [ r [ k ] ] . push ( k ) ;
      } else {

        // If it doesn't exist, create a new array for this frequency
        // and add the current number 'k' to it.
        c [ r [ k ] ] = [ k ] ;
      }
    }


    // After processing the current line and building 'c',
    // call the 'check' function to determine the card hand type
    // and print the result to the console.
    console . log ( check ( c ) ) ;

  } // End of the main processing loop.

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // IIFE immediately invoked with file system input.


/**
 * Determines the type of card hand based on the frequency map 'c'.
 *
 * @param {Array<Array<string>>} c - An array where indices represent frequencies
 *                                   and values are arrays of card numbers with that frequency.
 * @returns {string} The name of the card hand (e.g., 'four card', 'full house', 'straight').
 */
function check ( c ) {

  // Check for 'four card' (four cards of the same rank).
  if ( c [ 4 ] ) {
    return 'four card' ;
  }


  // Check for 'full house' (three of a kind and a pair).
  if ( c [ 3 ] && c [ 2 ] ) {
    return 'full house' ;
  }


  // Check for 'straight' (five consecutive cards).
  // This also handles cases where there are 5 unique cards (frequency 1).
  if ( c [ 1 ] && c [ 1 ] . length === 5 ) {

    // Extract the five unique cards.
    var a = c [ 1 ] ;

    // Convert card values to numbers and sort them in ascending order.
    a = a . map ( Number ) . sort ( function ( a , b ) {
      // Standard numeric sort function.
      return a - b ;
    } ) ;

    // console.log(a); // Uncomment this line for debugging the sorted array values.

    // Special condition check: if the lowest card is greater than 9,
    // it's an invalid straight or not a straight that can be formed by 1-9 values, return null.
    // This might be specific to a game where cards are 1-9 or 1-10.
    if ( a [ 0 ] > 9 ) {
      return 'null' ;
    }


    // Check for a specific straight: 10, J, Q, K, A (assuming A is 1 or 11/14, here 10 is the key)
    // This condition might represent a straight starting from 10 if 10 is the second card.
    // This is a bit ambiguous without context of card values.
    if ( a [ 1 ] === 10 ) {
      return 'straight' ;
    }


    // General straight check: five consecutive numbers.
    if ( a [ 1 ] === a [ 0 ] + 1 &&
         a [ 2 ] === a [ 1 ] + 1 &&
         a [ 3 ] === a [ 2 ] + 1 &&
         a [ 4 ] === a [ 3 ] + 1
       ) {
      return 'straight' ;
    }
  }


  // Check for 'three card' (three of a kind).
  // This check comes after full house, so it handles cases where only three of a kind exists.
  if ( c [ 3 ] ) {
    return 'three card' ;
  }


  // Check for 'two pair' (two sets of pairs).
  if ( c [ 2 ] && c [ 2 ] . length === 2 ) {
    return 'two pair' ;
  }


  // Check for 'one pair' (a single pair).
  // This check comes after two pair and full house.
  if ( c [ 2 ] ) {
    return 'one pair' ;
  }


  // If none of the above card hands are found, return 'null'.
  return 'null' ;

} // End of the check function.