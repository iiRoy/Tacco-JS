var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ; // Read raw input from standard input.
// The 'fs' module is used for file system operations.
// '/dev/stdin' is a common path for standard input on Unix-like systems.


var   Arr   =   (   input . trim ( )   ) . split ( "\n" ) ; // Process input: trim whitespace, then split by newlines.
/*
 *  'input.trim()' removes any leading or trailing whitespace from the entire input string.
 *  '.split("\n")' then breaks the cleaned string into an array of substrings,
 *  where each substring was originally a line in the input.
 */


while ( true )
{
   // This is the main processing loop. It continues indefinitely until a specific break condition is met.

   var   n   =   Arr . shift ( )   -   0 ; /* Extract the first line, convert it to a number.
                                          * 'Arr.shift()' removes the first element (line) from the 'Arr' array
                                          * and returns it.
                                          * The '- 0' is a common JavaScript idiom to explicitly
                                          * convert a string to a number. */

   if (   n   ===   0   )
   {
       // If the numeric value 'n' is strictly equal to 0, it signals the end of the current dataset or program.
       break ; // Exit the 'while' loop.
   }


   var   ans   =   [ ] ; // Initialize an empty array to store the calculated results for the current dataset.


   for (   var   i   =   0 ;   i   <   n ;   i++   )
   {
      // Loop 'n' times, processing one record per iteration.

      var   arr   =   (   Arr . shift ( )   ) . split ( " " ) ;
      // Get the next line from 'Arr', then split it into an array of strings based on spaces.

      var   name   =   arr . shift ( ) ;
      // The first element of the 'arr' array is assumed to be a name; store it and remove it from 'arr'.

      arr   =   arr . map ( Number ) ;
      // Convert all remaining elements in the 'arr' array from strings to numbers.

      arr . unshift ( name ) ;
      // Add the previously extracted 'name' back to the beginning of the 'arr' array.
      // Now 'arr' contains [name, number1, number2, ...].


      /*
       * This is an Immediately Invoked Function Expression (IIFE).
       * It's defined and executed immediately.
       * It takes a specific set of parameters (L, P, A, B, C, D, E, F, S, M)
       * and performs calculations based on them.
       */
      ( function ( L , P , A , B , C , D , E , F , S , M )
      {
         // L: Label/Name, P: Points, A, B, C, D, E: Time components, F: Factor, S: Scale, M: Multiplier.

         var   time   =   A   +   B   +   C   +   (   (   D   +   E   )   *   M   ) ;
         // Calculate a 'time' value using a specific formula involving several parameters.

         var   money   =   (   F   *   S   *   M   )   -   P ;
         // Calculate a 'money' (or score) value using another formula.

         ans . push (   [   L ,   money   /   time   ]   ) ;
         // Store the label (L) and the ratio of 'money' to 'time' as an array pair into the 'ans' array.

      } ) . apply (   null ,   arr   ) ; // Execute the anonymous function, passing 'arr' elements as arguments.
      // 'null' as the first argument means the 'this' context inside the function will be global or undefined.
   }
   // End of the for loop. All 'n' records for the current dataset have been processed.


   ans . sort (   function (   a ,   b   )
   {
      // Sort the 'ans' array based on specific criteria.
      // Each element 'a' or 'b' in 'ans' is an array like [label, score].

      if (   a [ 1 ]   ==   b [ 1 ]   )
      {
          // If the scores (second element, index 1) are equal,
          // then sort by the label (first element, index 0) in ascending order.
          return   a [ 0 ]   >   b [ 0 ] ; // Returns true (1) if a[0] > b[0], false (0) otherwise.
      }
      else
      {
          // If scores are not equal, sort by score in descending order.
          return   b [ 1 ]   -   a [ 1 ] ; // A positive result means 'b' comes before 'a'.
      }
   }   ) ;


   ans . forEach (   function (   v   )
   {
       // Iterate over each element 'v' in the sorted 'ans' array.
       // 'v' is an array like [label, score].
       console . log (   v [ 0 ]   ) ; // Print only the label (first element) of each result.
   }   ) ;


   console . log ( "#" ) ; // Print a hash symbol as a separator after processing and printing each dataset.
}
// End of the main while loop. The program exits when 'n' is 0.