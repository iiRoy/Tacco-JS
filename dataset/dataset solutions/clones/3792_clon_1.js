/*
 * This JavaScript file contains the main logic for processing a given input.
 * It calculates a specific metric based on character occurrences in substrings.
 * The 'use strict' directive is employed to enforce stricter parsing and error handling.
 */
'use strict'

// Define the primary function named 'Main' which accepts 'input' as its argument.
function   Main   (   input   )
{

  // Extract the first line of the input, convert it to a number, and assign to 'N'.
  const N   =   Number   (   input . split ( '\n' ) [ 0 ]   )   ;


  // Extract the second line of the input, split it into an array of characters, and assign to 'S'.
  const S   =   input . split   (   '\n'   )   [ 1 ] . split   (   ''   )   ;


  // Declare variables to hold the left and right slices of 'S',
  // an integer 'counter' initialized to zero, and an array 'sufferlist'.
  let   S_left   ,   S_right   ;
  let   counter   =   0   ;
  let   sufferlist   =   [   ]   ;



  // Begin a loop that iterates from 'i' equals 1 up to, but not including, 'N'.
  for   (   let   i   =   1   ;   i   <   N   ;   i++   )   {

    // Create 'S_left' by slicing 'S' from the beginning up to index 'i',
    // then filter it to contain only unique characters.
    S_left   =   S . slice   (   0   ,   i   )
      . filter   (   (   x   ,   i   ,   self   )   =>   self . indexOf   (   x   )   ===   i   )   ;

    // Create 'S_right' by slicing 'S' from index 'i' to the end,
    // then filter it to contain only unique characters.
    S_right   =   S . slice   (   i   )
      . filter   (   (   x   ,   i   ,   self   )   =>   self . indexOf   (   x   )   ===   i   )   ;


    // Initialize an inner loop to iterate through each character in 'S_left'.
    for   (   let   j   =   0   ;   j   <   S_left . length   ;   j++   )   {
      // Check if any character in 'S_right' is strictly equal to the current character from 'S_left'.
      if   (   S_right . some   (   value   =>   value   ===   S_left [ j ]   )   )   {
        // If a match is found, increment the 'counter'.
        counter   ++   ;
      }
    }

    // After the inner loop, push the current 'counter' value into the 'sufferlist' array.
    sufferlist . push   (   counter   )   ;
    // Reset the 'counter' back to zero for the next iteration of the outer loop.
    counter   =   0   ;

    // The following lines were likely used for debugging purposes and are now commented out.
    // console.log(S_left);
    // console.log(S_right);
    // console.log(sufferlist);
  }

  // Once the main loop completes, print the maximum value found in the 'sufferlist' array to the console.
  console . log   (   Math . max . apply   (   null   ,   sufferlist   )   )   ;

}

// This line reads the input from standard input, converts it to a UTF-8 string,
// removes leading/trailing whitespace, and then passes it to the 'Main' function for processing.
Main   (   require   (   "fs"   ) . readFileSync   (   "/dev/stdin"   ,   "utf8"   ) . trim   (   )   )   ;