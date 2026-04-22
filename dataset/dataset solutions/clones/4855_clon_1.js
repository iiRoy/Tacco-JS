/*******************************************************************************
 * This JavaScript code processes an input string to check for a specific
 * palindromic-like property involving mirrored characters.
 * It's a demonstration of string manipulation and conditional logic.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 ******************************************************************************/

function Main
(
input // The input string to be processed.
)
{ // Start of the Main function block.

   // Declare a constant array 'arr' by splitting the input string into individual characters.
   const arr = input . split ( "" ) ;

   // Check if the length of the array is an odd number.
   // If it is, the string cannot satisfy the condition, so print "No" and exit.
   if ( arr . length % 2 !== 0 )
   {
      // Output "No" to the console.
      console . log ( "No" ) ;

      // Terminate the function execution.
      return ;
   }

   // Divide the array into two halves.
   // 'a' gets the first half of the characters.
   const a = arr . slice ( 0 , arr . length / 2 ) ;

   // 'b' gets the second half of the characters.
   const b = arr . slice ( arr . length / 2 , arr . length ) ;


   // Compare the first half (joined back to a string) with the
   // reversed and mirrored second half (also joined to a string).
   if ( a . join ( "" ) === b . reverse ( ) . map ( mirror ) . join ( "" ) )
   {
      // If they match, print "Yes".
      console . log ( "Yes" ) ;
   }
   else
   {
      // Otherwise, print "No".
      console . log ( "No" ) ;
   }


   /**
    * Helper function 'mirror' to transform specific characters.
    * This function implements a simple character mirroring logic.
    * @param {string} a - The character to be mirrored.
    * @returns {string} The mirrored character, or the original if no mirror rule applies.
    */
   function mirror ( a )
   {
      // Use a switch statement to handle different character mirroring rules.
      switch ( a )
      {
         case "b" :
            // 'b' mirrors to 'd'.
            return "d" ;

         case "d" :
            // 'd' mirrors to 'b'.
            return "b" ;

         case "p" :
            // 'p' mirrors to 'q'.
            return "q" ;

         case "q" :
            // 'q' mirrors to 'p'.
            return "p" ;

         // If no case matches, the original character is implicitly returned (or undefined if no default).
         // For this problem context, it implies characters not in 'b','d','p','q' are not mirrored.
      } // End of switch statement.

   } // End of mirror function.

} // End of Main function.


// Invoke the Main function with input read from standard input.
// This line uses Node.js specific modules to read file content.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;