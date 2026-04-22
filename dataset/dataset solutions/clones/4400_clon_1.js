/*
 * This JavaScript file implements a function to find the smallest character
 * that is greater than all characters present in the input string.
 * It considers characters 'a' through 'z' in alphabetical order.
 * If all characters 'a' through 'z' are present, it outputs "None".
 */

 'use strict'; // Enforces strict mode for cleaner code and fewer errors.

 /**
  * The main entry point function for the program.
  * It processes the input string to determine the next character.
  *
  * @param {string} input - The input string provided to the program.
  */
 function Main ( input )
 {
     // Store the input string in a constant variable S.
     const S = input ;

     // Initialize a Set to store unique characters from the input string.
     // Sets automatically handle uniqueness, which is useful here.
     const chars = new Set ( ) ;

     // Iterate through each character of the input string S.
     // The loop runs from the first character (index 0) up to, but not including, the length of the string.
     for ( let i = 0 ; i < S . length ; i ++ )
     {
         // Add the current character to the 'chars' Set.
         // If the character is already in the Set, adding it again has no effect.
         chars . add ( S [ i ] ) ;
     }


     // Convert the Set of unique characters into an Array.
     // Then, sort this array alphabetically.
     // The Array.from(chars.values()) method extracts all values from the Set into a new array.
     const sorted = Array . from ( chars . values ( ) ) . sort ( ) ;

     // Initialize 'firstChar' to 'a'. This will be the default smallest character
     // if the input string is empty or contains characters beyond 'z'.
     let firstChar = 'a' ;

     // Iterate over the sorted characters in reverse order.
     // This allows us to easily find the first missing character by checking from 'z' downwards.
     for ( let c of sorted . reverse ( ) )
     {
         // Use a switch statement to determine the next character based on the current character 'c'.
         // This essentially finds the character immediately following 'c' in the alphabet.
         switch ( c )
         {
             case 'a' :
                 firstChar = 'b' ; // If 'a' is present, the next candidate is 'b'.
                 break ;

             case 'b' :
                 firstChar = 'c' ; // If 'b' is present, the next candidate is 'c'.
                 break ;

             case 'c' :
                 firstChar = 'd' ; // And so on...
                 break ;

             case 'd' :
                 firstChar = 'e' ;
                 break ;

             case 'e' :
                 firstChar = 'f' ;
                 break ;

             case 'f' :
                 firstChar = 'g' ;
                 break ;

             case 'g' :
                 firstChar = 'h' ;
                 break ;

             case 'h' :
                 firstChar = 'i' ;
                 break ;

             case 'i' :
                 firstChar = 'j' ;
                 break ;

             case 'j' :
                 firstChar = 'k' ;
                 break ;

             case 'k' :
                 firstChar = 'l' ;
                 break ;

             case 'l' :
                 firstChar = 'm' ;
                 break ;

             case 'm' :
                 firstChar = 'n' ;
                 break ;

             case 'n' :
                 firstChar = 'o' ;
                 break ;

             case 'o' :
                 firstChar = 'p' ;
                 break ;

             case 'p' :
                 firstChar = 'q' ;
                 break ;

             case 'q' :
                 firstChar = 'r' ;
                 break ;

             case 'r' :
                 firstChar = 's' ;
                 break ;

             case 's' :
                 firstChar = 't' ;
                 break ;

             case 't' :
                 firstChar = 'u' ;
                 break ;

             case 'u' :
                 firstChar = 'v' ;
                 break ;

             case 'v' :
                 firstChar = 'w' ;
                 break ;

             case 'w' :
                 firstChar = 'x' ;
                 break ;

             case 'x' :
                 firstChar = 'y' ;
                 break ;

             case 'y' :
                 firstChar = 'z' ;
                 break ;

             case 'z' :
                 firstChar = 'None' ; // If 'z' is present, then all characters 'a' through 'z' must be present,
                                       // so there is no character greater than all of them.
                 break ;
         } // End of switch statement for character 'c'.
     } // End of for...of loop.

     // Output the determined 'firstChar' to the console.
     // This will be the smallest character not found in the input string,
     // or 'None' if all lowercase letters are present.
     console . log ( firstChar ) ;
 }

 // Call the Main function, passing the input read from standard input.
 // require("fs").readFileSync("/dev/stdin", "utf8") reads the entire file
 // at /dev/stdin (which is typically where standard input is redirected in competitive programming environments)
 // as a UTF-8 encoded string.
 Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;