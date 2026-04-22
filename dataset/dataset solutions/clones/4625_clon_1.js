/*
 * This script is designed to process numerical input from standard input.
 * It reads a specific line, parses numbers, and then applies a unique
 * counting algorithm based on accumulator values and a toggling boolean state.
 *
 * The primary goal is to determine the minimum count derived from two
 * different initial states of the boolean flag in the core processing function.
 */


// Declare a variable 'a' which will hold an array of integers.
// This line performs several operations:
// 1. Reads the content of '/dev/stdin' as UTF-8.
// 2. Splits the entire content by newline characters into an array of lines.
// 3. Selects the second line of input (index 1).
// 4. Splits this selected line by spaces into an array of string numbers.
// 5. Maps each string number to its integer equivalent using parseInt with base 10.
var a = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . split ( "\n" ) [ 1 ] . split ( " " ) . map ( e => parseInt ( e , 10 ) ) ;



/**
 * This is the main function that encapsulates the core logic of the program.
 * It iterates through the globally defined array 'a', maintaining an accumulator
 * and a counter, whose behavior depends on a boolean flag 'p'.
 *
 * @param {boolean} p - The initial state of the boolean flag for this run.
 *                      It dictates whether the function initially seeks
 *                      positive or negative accumulator states.
 * @returns {number} The final accumulated count after processing all elements in 'a'.
 */
function Main ( p ) {


  // Initialize 'acc' (accumulator) to 0. This variable will sum up elements from 'a'.
  // Initialize 'cnt' (counter) to 0. This variable will track the number of adjustments made.
  var acc = 0 , cnt = 0 ;


  // Begin a loop that iterates over each element 'i' in the array 'a'.
  for ( var i of a ) {

    // Add the current element 'i' to the accumulator.
    acc += i ;


    // Check the current state of the boolean flag 'p'.
    // This flag determines the specific logic to apply in this iteration.
    if ( p ) {

      // If 'p' is true, we are in a "positive-seeking" mode.
      // We want to ensure 'acc' becomes negative if it's currently non-negative.
      if ( acc >= 0 ) {

        // If 'acc' is 0 or positive, we need to adjust it.
        // The counter 'cnt' is incremented by 1 plus the current 'acc' value.
        // This effectively counts the "steps" needed to bring 'acc' to -1.
        cnt += 1 + acc ;

        // Reset 'acc' to -1 to ensure it is negative for the next potential check
        // when 'p' is true again.
        acc = -1 ;
      }

      // After processing this element with 'p' being true,
      // flip the flag to false for the next iteration.
      p = false ;

    } else {

      // If 'p' is false, we are in a "negative-seeking" mode.
      // We want to ensure 'acc' becomes positive if it's currently non-positive.
      if ( acc <= 0 ) {

        // If 'acc' is 0 or negative, we need to adjust it.
        // The counter 'cnt' is incremented by 1 minus the current 'acc' value.
        // This effectively counts the "steps" needed to bring 'acc' to 1.
        cnt += 1 - acc ;

        // Reset 'acc' to 1 to ensure it is positive for the next potential check
        // when 'p' is false again.
        acc = 1 ;
      }

      // After processing this element with 'p' being false,
      // flip the flag to true for the next iteration.
      p = true ;
    }

  }

  // Once all elements in 'a' have been processed,
  // return the final accumulated count.
  return cnt ;

}


// Execute the 'Main' function twice, once with an initial 'p' of 'false',
// and once with an initial 'p' of 'true'.
// Then, determine the minimum of the two returned counts using 'Math.min()'.
// Finally, print this minimum value to the console.
console . log ( Math . min ( Main ( false ) , Main ( true ) ) ) ;