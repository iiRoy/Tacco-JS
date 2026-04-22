/*
 * This script initializes standard input/output
 * and processes lines of input data.
 * It's a Type I clone, meaning only whitespace and comments
 * have been altered.
 */

 process . stdin . resume ( ) ; // Resume the standard input stream.

 process . stdin . setEncoding ( 'utf8' ) ;    /* Set the character encoding for input */

// Declare an array to store all incoming lines from standard input.
 var lines = [ ] ;

/*
 * Create a readline interface.
 * This interface allows reading data from a Readable stream (like process.stdin)
 * one line at a time.
 */
 var reader = require ( 'readline' ) . createInterface ( {
      // The input stream to listen to.
      input: process . stdin ,
      // The output stream for prompts, though not used explicitly here for prompts.
      output: process . stdout
 } ) ;

// --- Event Listener: 'line' ---
// This event is emitted whenever the input stream receives a '\n' (newline) character.
 reader . on ( 'line' , ( line ) => {
   // Push the received line into our 'lines' array.
   lines . push ( line ) ;
 } ) ;


// --- Event Listener: 'close' ---
// This event is emitted when the input stream receives a 'end' signal.
 reader . on ( 'close' , ( ) => {

   // Parse the first line as an integer, representing 'n'.
   var n = Number ( lines [ 0 ] ) ;

   // Split the second line by spaces to get an array of strings.
   var a = lines [ 1 ] . split ( ' ' ) ;

   // Map each string in array 'a' to its numerical equivalent.
   a = a . map ( function ( str ) {
     return Number ( str )
   } ) ;

   // Sort the array 'a' using a custom comparison function 'koujun'.
   a . sort ( koujun ) ;

   // Initialize variables for maximum value, Alice's score, and Bob's score.
   var max   =   0   ;
   var alice = 0 ;
   var bob =   0 ;

   // The following block is commented out in the original code.
   // It represents an alternative logic for calculating scores,
   // possibly from an earlier iteration or a different problem variant.
   /*
    * This is a multi-line comment block.
    * The code within this block is intended to be ignored by the JavaScript engine.
    * It demonstrates a turn-based selection process.
    */
   // while(true){ // Loop indefinitely until a break condition is met.
   //   max = Math.max(...a); // Find the maximum value in the current array 'a'.
   //   alice += max; // Add the maximum value to Alice's score.
   //   var index = a.indexOf(max); // Find the index of the maximum value.
   //   a.splice(index,1); // Remove the maximum value from the array.
   //   n--; // Decrement 'n', representing the number of remaining elements.
   //   if(n == 0){ // Check if all elements have been processed.
   //     break; // Exit the loop if no elements are left.
   //   }
   //
   //   max = Math.max(...a); // Find the next maximum value for Bob.
   //   bob += max; // Add this value to Bob's score.
   //   var index = a.indexOf(max); // Find its index.
   //   a.splice(index,1); // Remove it from the array.
   //   n--; // Decrement 'n' again.
   //   if(n == 0){ // Check again for remaining elements.
   //     break; // Exit if done.
   //   }
   //
   // }
   // End of the commented-out while loop block.

   // Loop through the sorted array 'a' to distribute scores.
   // The problem likely involves players taking turns picking from a sorted list.
   for ( i = 0 ; i < n ; i ++ ) {
     // If the index 'i' is odd (1st, 3rd, 5th, etc. pick for Alice if 0-indexed for Bob),
     // Alice gets the element. Note: If it's a 0-indexed array and players pick alternately,
     // the first player (Bob, assuming 0-index) gets 0, 2, 4... and Alice gets 1, 3, 5...
     if ( i % 2 == 1 ) {
       alice += a [ i ] ; // Add to Alice's total.
     }
     else { // If the index 'i' is even (0th, 2nd, 4th, etc. pick for Bob).
       bob += a [ i ] ; // Add to Bob's total.
     }
   }

   // Output the difference between Alice's score and Bob's score to the console.
   console . log ( alice - bob ) ;
 } ) ;