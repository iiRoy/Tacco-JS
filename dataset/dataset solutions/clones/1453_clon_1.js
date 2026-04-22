/*
 * This is a modified version of the original script.
 * It still performs the exact same operations
 * but with different formatting and comments.
 */


 var   log  =  console . log ; // Alias for console.log for convenience


 // Check if the 'process' global object is defined,
 // indicating a Node.js-like environment.
 if  (  typeof   process  !=  "undefined"  )
 {
  var   input   =   "" ; // Initialize an empty string to accumulate standard input data.

  process . stdin . resume ( ) ; // Ensure the standard input stream is open and emitting 'data' events.

  // Set the character encoding for the standard input stream to UTF-8.
  process . stdin . setEncoding ( 'utf8' ) ;


  // Attach an event listener for the 'data' event on standard input.
  // This function will be called whenever a chunk of data is received.
  process . stdin . on ( 'data' ,  function  (  chunk  )
  {
   input   +=   chunk ; // Append the received data chunk to the 'input' string.
  } ) ;


  // Attach an event listener for the 'end' event on standard input.
  // This function will be called once all input has been received.
  process . stdin . on ( 'end' ,  function  (  )
  {
   before ( input ) ; // Call the 'before' function to process the collected input.
  } ) ;
 }


 // This function serves as a preprocessing step for the input.
 function   before ( input )
 {
  // Split the entire input string into an array of lines based on the newline character.
  var   lines   =   input . split ( "\n" ) ;

  lines . shift ( ) ; // Remove the first element (line) from the 'lines' array.
  lines . pop ( ) ; // Remove the last element (line) from the 'lines' array.

  main ( lines ) ; // Pass the processed lines to the 'main' function for core logic.
 }


 // --- Core Logic Section ---


 // The main function where the primary data processing occurs.
 function   main ( lines )
 {
  // Retrieve the last line from the 'lines' array,
  // split it by spaces, and then map each resulting string to a number.
  var   last   =   lines . pop ( ) . split ( " " ) . map ( function  (  e  )
  {
   return   Number ( e ) ; // Convert the string element 'e' into a number.
  } ) ;

  // Sort the array of numbers in ascending order using a custom comparison function,
  // then join the sorted numbers back into a single string separated by spaces,
  // and finally log the result to the console.
  log ( last . sort ( function  (  a ,  b  )
  {
   return   a   -   b ; // Comparison logic for numeric ascending sort.
  } ) . join ( " " ) ) ;
 }