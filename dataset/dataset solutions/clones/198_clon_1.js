/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact semantic and structural identity,
 * only varying in whitespace and comments as per definition.
 */
// Main application entry point function declaration.
function   main   (  )
{
  // Declaring a variable to store the counts of blood types.
  var total =
  {
    A  :  0 ,   // Counter for blood type A
    B  :  0 ,   // Counter for blood type B
    AB :  0 ,   // Counter for blood type AB
    O  :  0     // Counter for blood type O
  } ;


  // Iterating through each line of the input data.
  input . forEach (   function   (   line   )
  {
    // Skip processing if the line is empty after trimming whitespace.
    if   (   line . trim (  )   ===   ''   )
    {
      return ;
    }
    // Increment the counter for the detected blood type.
    // The blood type is expected to be the second element after splitting by comma.
    total [   line . split (   ','   )   [   1   ]   ]   ++   ;
  }   ) ;


  // Outputting the final counts for each blood type to the console.
  console . log   (   total . A   ) ;

  // Output B type count.
  console . log   (   total . B   ) ;

  // Output AB type count.
  console . log   (   total . AB   ) ;

  // Output O type count.
  console . log   (   total . O   ) ;
} // End of the main function definition.


// Global variable to accumulate input chunks.
var   input   =   ''   ;


// Resuming the standard input stream to listen for data.
process . stdin . resume (  ) ;


// Setting the encoding for the standard input stream to UTF-8.
process . stdin . setEncoding (   'utf8'   ) ;


// Event listener for incoming 'data' chunks from standard input.
process . stdin . on (   'data' ,   function   (   chunk   )
{
  // Appending each received chunk to the 'input' variable.
  input   +=   chunk   ;
}   ) ;


// Event listener for the 'end' of the standard input stream.
process . stdin . on (   'end' ,   function   (  )
{
  // Once all input is received, split it by newlines into an array.
  input   =   input . split (   '\n'   ) ;

  // Call the main function to process the collected input.
  main (  ) ;
}   ) ;