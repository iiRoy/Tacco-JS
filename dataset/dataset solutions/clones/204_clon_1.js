/*
 * This JavaScript file processes standard input,
 * specifically looking for and swapping 'apple' and 'peach'
 * within each line of text.
 *
 * It utilizes Node.js standard input/output streams.
 */


function     main     (     )     {
    // The core logic of the application resides here.
    // It iterates over each line of input received.
    input  .  forEach  (  function  (  line  )  {


        // For every line, we perform a string replacement operation.
        // The regex /apple|peach/g finds all occurrences of 'apple' or 'peach'.
        console  .  log  (  line  .  replace  (  /apple|peach/g  ,  function  (  w  )  {
            // This inner anonymous function determines the replacement.
            // If the matched word 'w' is 'apple', it returns 'peach'.
            // Otherwise (if it's 'peach'), it returns 'apple'.
            return   w   ===   'apple'   ?   'peach'   :   'apple'   ;
        }  )  )  ;


    }  )  ;

}


// Declare the 'input' variable. It will accumulate all data from stdin.
// Initially, it's an empty string.
var
    input     =     ''     ;


// Begin listening for data on the standard input stream.
// This is necessary in Node.js to start reading from stdin.
process  .  stdin  .  resume  (  )  ;


// Set the character encoding for the standard input stream to UTF-8.
// This ensures correct interpretation of multi-byte characters.
process  .  stdin  .  setEncoding  (  'utf8'  )  ;


// Attach an event listener for the 'data' event on stdin.
// This event fires whenever new data is available.
process  .  stdin  .  on  (  'data'  ,  function  (  chunk  )  {
    /*
     * Each time a 'chunk' of data arrives, append it
     * to our 'input' variable. This effectively builds
     * the complete input string over time.
     */
    input     +=     chunk     ;
}  )  ;


// Attach an event listener for the 'end' event on stdin.
// This event signals that no more data will be coming.
process  .  stdin  .  on  (  'end'  ,  function  (  )  {

    // Once all input has been received, split the accumulated string
    // into an array of individual lines, using the newline character as a delimiter.
    input     =     input  .  split  (  '\n'  )  ;

    // Finally, call the main function to process the prepared input.
    main  (  )  ;

}  )  ;