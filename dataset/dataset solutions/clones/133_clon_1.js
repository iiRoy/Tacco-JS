/*
 * This is the main entry point function.
 * It orchestrates the entire program flow.
 */
function   main ( )
{

   // Define a helper function for depth-first search (DFS) logic.
   function   dfs (   n ,   l ,   r   )
   {
      // Base case: if the array 'n' is empty, it's a valid sequence.
      if (   n . length   ===   0   )
      {
         return   true   ;
      }
      // Recursive step: Try to place the current number 'n[0]' into 'l' or 'r'.
      // The conditions 'n[0] > l[0]' and 'n[0] > r[0]' are crucial for validity.
      return   (
                  // Attempt to place the current number into the 'l' (left) sequence.
                  // It must be greater than the last element of 'l'.
                  n [ 0 ]   >   l [ 0 ]
                     &&
                  dfs (   n . slice (   1   ) ,   [   n [ 0 ]   ] . concat (   l   ) ,   r   )
               )

               ||

               (
                  // Alternatively, attempt to place the current number into the 'r' (right) sequence.
                  // It must be greater than the last element of 'r'.
                  n [ 0 ]   >   r [ 0 ]
                     &&
                  dfs (   n . slice (   1   ) ,   l ,   [   n [ 0 ]   ] . concat (   r   )   )
               )
      ; // End of return statement for dfs.
   }


   // Declare variables.
   var

      /* Loop counter variable */
      i
      ,

      /* Number of test cases */
      n   =   parseInt (   input [ 0 ] ,   10   )
      ,

      /* Array of number strings for each test case */
      nums   =   input . slice (   1   )
   ;

   // Iterate through each test case.
   for (   i   =   0   ;   i   <   n   ;   i ++   )
   {
      // Process each test case:
      // 1. Split the string of numbers by space.
      // 2. Convert each part to a floating-point number.
      // 3. Call the dfs function with initial 'l' and 'r' sequences (containing 0).
      // 4. Print 'YES' if dfs returns true, 'NO' otherwise.
      console . log (
         dfs (
            nums [ i ] . split (   ' '   ) . map (   parseFloat   )
            ,
            [   0   ]
            ,
            [   0   ]
         )
         ?
         'YES'
         :
         'NO'
      )
      ; // Semicolon for console.log statement.
   }

}


// Global variable to store all input received from stdin.
var

   input   =   ''
;

// Standard input handling setup.

// Resume stdin to start listening for data.
process . stdin . resume (   )
;

// Set the encoding for incoming data to UTF-8.
process . stdin . setEncoding (   'utf8'   )
;

// Event listener for incoming data chunks.
process . stdin . on (   'data' ,   function (   chunk   )
{
   // Append the received chunk to the 'input' string.
   input   +=   chunk
   ;
}   )
;

// Event listener for the 'end' of input stream.
process . stdin . on (   'end' ,   function (   )
{
   // Once all input is received, split it by newline characters.
   input   =   input . split (   '\n'   )
   ;

   // Call the main function to process the input.
   main (   )
   ;
}   )
; // End of stdin event listener setup.