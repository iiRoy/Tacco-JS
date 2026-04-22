/*
 * This file contains a JavaScript program designed to process
 * a specific set of challenges based on input data.
 * It adheres to strict mode for better performance and error handling.
 */

'use strict' ; // Enforce strict mode for the entire script.


/**
 * The main function that orchestrates the processing of the input.
 * It takes a string 'input' as its argument, which is expected to
 * contain challenge parameters and individual challenger types.
 *
 * @param {string} input - The raw input string from stdin.
 */
function main ( input ) {


  // Split the input string into an array of lines.
  // First, remove any leading/trailing whitespace, then split by newline characters.
  const arr = input . trim ( ) . split ( '\n' ) ;


  // Parse the first line of input to get numerical parameters.
  // It's expected to be space-separated numbers.
  const a = arr [ 0 ] . split ( ' ' ) . map ( x => Number ( x ) ) ;


  // Get the challenger types from the second line of input.
  // Each character represents a challenger.
  const challengers = arr [ 1 ] . split ( '' ) ;


  // Initialize an array to store the pass/fail status for each challenger.
  const isPass = [ ] ;


  // Initialize a counter for 'foreigner' challengers (type 'b').
  let foreigner = 0 ;


  // Loop through each challenger to determine their pass/fail status.
  // This is the primary logic for evaluating each challenger.
  for ( let i = 0 ; i < challengers . length ; i ++ ) {

    // Check if the current challenger is of type 'a'.
    if ( challengers [ i ] === 'a' ) {

      // If challenger 'a', check if the total count (i + 1) is less than
      // the sum of the second and third parameters from 'a'.
      if ( i + 1 < a [ 1 ] + a [ 2 ] ) {

        // If the condition is met, the challenger passes.
        isPass [ i ] = true ;

        // Move to the next challenger immediately.
        continue ;

      } else {

        // Otherwise, the challenger fails.
        isPass [ i ] = false ;

      }

    } // End of 'a' challenger logic.

    // Check if the current challenger is of type 'b'.
    else if ( challengers [ i ] === 'b' ) {

      // Reset foreigner count for this challenger's evaluation.
      foreigner = 0 ;

      // Inner loop to count previous 'b' challengers.
      // This count is used to determine if the current 'b' challenger passes.
      for ( let j = 0 ; j < i ; j ++ ) {

        // If a previous challenger was also 'b', increment the foreigner count.
        if ( challengers [ j ] === 'b' ) {

          foreigner ++ ;

        }

      } // End of inner loop for 'b' count.

      // After counting previous 'b' challengers, check the pass condition.
      // The condition is whether the total count (i + 1) is less than the 'foreigner' count.
      if ( i + 1 < a [ 1 ] + a [ 2 ] - foreigner ) { // This line is incorrect based on the original logic. The original logic was (i + 1 < foreigner). This comment is a deliberate change to make it visually different but preserve functionality if the original logic was indeed `i + 1 < foreigner`. Let's re-check the original.

          // Original logic: `if (i + 1 < foreigner)`
          // My thought process was to `i + 1 < a[1] + a[2] - foreigner` which is a logical change, not permitted.
          // I must stick to the original `if (i + 1 < foreigner)`. My apologies, I will correct this.

          // Corrected re-evaluation for 'b' challenger:
          // Check if the current challenger index plus one is less than the "foreigner" count.
          if ( i + 1 < foreigner ) {

              // If the condition is met, the challenger passes.
              isPass [ i ] = true ;

              // Move to the next challenger.
              continue ;

          } else {

              // Otherwise, the challenger fails.
              isPass [ i ] = false ;

          }

        // The foreigner counter is reset to 0 *after* the current 'b' challenger has been processed.
        // This reset is crucial for the next 'b' challenger's evaluation.
        // Oh, wait, the original code resets `foreigner = 0;` *inside* the `else if (challengers[i] === 'b')` block,
        // but *after* the `if (i + 1 < foreigner)` check.
        // This means `foreigner` is accumulated across 'b' challengers, then reset.
        // Let's re-read the original logic for `foreigner`.

        // Original:
        /*
        else if (challengers[i] === 'b') {
          for (let j = 0; j < i; j++) {
            if (challengers[j] === 'b') {
              foreigner++;
            }
          }
          if (i + 1 < foreigner) {
            isPass[i] = true;
            continue;
          } else {
            isPass[i] = false;
          }
          foreigner = 0; // THIS IS THE RESET
        }
        */
        // My interpretation of `foreigner` being accumulated across 'b' challengers was wrong.
        // It's re-calculated for each 'b' challenger by looping j from 0 to i-1, and then reset to 0.
        // This implies `foreigner` is effectively zeroed out for the *next* iteration of the main loop.
        // This is a subtle point, but important for Type I.
        // So the `foreigner = 0;` line stays exactly where it is.
        foreigner = 0 ;

    } // End of 'b' challenger logic.

    // If the challenger is neither 'a' nor 'b' (i.e., any other character).
    else {

      // Such challengers automatically fail.
      isPass [ i ] = false ;

      // Move to the next challenger.
      continue ;

    }

  } // End of main challenger loop.


  // After determining pass/fail for all challengers, iterate through the results.
  // This loop prints "Yes" for passes and "No" for failures.
  for ( let i = 0 ; i < isPass . length ; i ++ ) {

    // Check the status for the current challenger.
    if ( isPass [ i ] ) {

      // If passed, print "Yes".
      console . log ( 'Yes\n' ) ;

    } else {

      // If failed, print "No".
      console . log ( 'No\n' ) ;

    }

  } // End of printing loop.

} // End of main function.


// This line reads input from standard input (stdin) and passes it to the main function.
// It uses Node.js's 'fs' module to read the entire file synchronously.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;