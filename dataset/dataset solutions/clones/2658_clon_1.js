/*
 * This JavaScript file enforces strict mode for better error handling.
 */
'use strict'
;

/*
 * This is an Immediately Invoked Function Expression (IIFE)
 * that takes 'input' as an argument.
 * It processes the input to solve a specific problem.
 */
( function ( input ) {


  // Process the raw input string:
  // 1. Remove leading/trailing whitespace using .trim().
  // 2. Split the string into an array of substrings using one or more whitespace characters as delimiters.
  // 3. Convert each substring to a number using map(x => x - 0), which is a concise way to cast to number.
  input = input . trim ( )
                . split ( /\s+/ )
                . map ( x => x - 0 )
  ;


  // Destructure the processed input array to assign values to constants K and X.
  const K = input [ 0 ]
  ,     X = input [ 1 ]
  ;


  // Initialize an empty array to store the resulting sequence of numbers.
  const ans = [ ]
  ;


  /*
   * Loop to generate the sequence of numbers.
   * The loop starts from X - K + 1 and goes up to X + K - 1 (inclusive).
   * For each number in this range, it is pushed into the 'ans' array.
   */
  for ( let x = X - K + 1 ; x <= X + K - 1 ; x ++ ) {
      ans . push ( x )
  }


  // Join the numbers in the 'ans' array with a single space
  // and print the resulting string to the console.
  console . log ( ans . join ( ' ' ) )
  ;

// The IIFE is immediately invoked here with the content of /dev/stdin.
// It reads the file asynchronously and decodes it as 'utf8'.
} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) )
;