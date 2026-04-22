/*
 * This JavaScript code processes a sequence of operations.
 * It reads input from standard input, parses it, and
 * performs calculations based on a specific logic involving
 * a stack-like structure.
 *
 * Author: [Your Name/Placeholder]
 * Date: [Current Date/Placeholder]
 * Version: 1.0
 */

// Initialize input stream and read data.
var        input        =      require('fs')   .   readFileSync('/dev/stdin', 'utf8')        ;


// Process the raw input string: trim whitespace and split into lines.
var  Arr   =   (input.trim()) .split("\n")   ;


// Extract the first line, convert to a number, representing 'n'.
var   n   =   Arr.shift() - 0   ;


// 'before' stores the last encountered character, important for logic.
var  before = ""     ;


// 's' acts as a stack or accumulator for processed data.
var    s    =    [ ]     ;


// Main processing loop: iterates 'n' times.
for ( var i = 0 ; i < n ; i ++ )
{
   // Split the current line into an array of two parts.
   var arr = Arr[i] . split(" ") ;

   // Extract the first part, 'a', which is a character/string.
   var  a  =  arr[0] ;

   // Extract the second part, 'b', converting it to a number.
   var b   =   arr[1] - 0 ;

   // Early exit condition: if the first character is a closing parenthesis.
   if ( i == 0 && a == ")" )
   {
      return console.log("NO") ; // Output "NO" and terminate.
   }

   // Check if the current character 'a' is the same as the 'before' character.
   if ( before == a )
   {
      // If they are the same, accumulate 'b' to the last element in 's'.
      s[s.length - 1] += b ;
   }
   else
   {
      // If 'a' is a closing parenthesis.
      if ( a == ")" )
      {
         // Get the value from the top of the stack (second to last element).
         var z = s[s.length - 1] ;

         // Case 1: If 'z' is greater than 'b'.
         if ( z > b )
         {
            s[s.length - 1] -= b ; // Subtract 'b' from 'z'.
         }
         // Case 2: If 'z' is less than 'b'.
         if ( z < b )
         {
            s.pop() ; // Remove the last element.
            s.pop() ; // Remove the second to last element.
            s.push(a) ; // Push 'a' onto the stack.
            s.push(b - z) ; // Push the difference (b - z) onto the stack.
         }
         // Case 3: If 'z' is equal to 'b'.
         if ( z == b )
         {
            s.pop() ; // Remove the last element.
            s.pop() ; // Remove the second to last element.
         }
      }
      else
      {
         // If 'a' is not a closing parenthesis, push 'a' and 'b' onto the stack.
         s.push(a) ;
         s.push(b) ;
         before = a ; // Update 'before' to the current 'a'.
      }
   }
}

// After the loop, check the final state of the stack 's'.
if (s.length == 0)
{
   // If the stack is empty, it indicates a "YES" condition.
   console.log("YES") ;
}
else
{
   // Otherwise, if the stack is not empty, it's a "NO" condition.
   console.log("NO") ;
}
// End of program.