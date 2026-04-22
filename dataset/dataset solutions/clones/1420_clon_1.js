/*
 * This JavaScript program reads student scores from standard input,
 * calculates their grades based on specific criteria, and prints the result.
 *
 * Each line of input is expected to contain three space-separated integers:
 * midterm score (m), final score (f), and retake score (r).
 * The program terminates when it encounters the input line "-1 -1 -1".
 *
 * Grade Criteria:
 * - 'A': m + f >= 80
 * - 'B': m + f >= 65
 * - 'C': m + f >= 50 OR (m + f >= 30 AND r >= 50)
 * - 'D': m + f >= 30 (but not meeting 'C' criteria with retake)
 * - 'F': Otherwise, or if m = -1 and f = -1
 *
 * Author: Code Clone Generator
 * Version: 1.0
 * Date: 2023-10-27
 */

// Require the 'fs' (file system) module to read from standard input.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim any leading/trailing whitespace from the input string and then
// split it into an array of strings, where each string is a line.
var arr = input . trim ( ) . split ( "\n" ) ;


// Start an infinite loop to process input lines one by one.
while ( true )
{
   // Extract the first element (line) from the 'arr' array.
   var x = arr . shift ( ) ;

   // Check if the current line is the termination signal.
   if ( x == "-1 -1 -1" )
   {
      // If it is, break out of the infinite loop.
      break ;
   }


   // Split the current line 'x' by spaces and convert each part to a Number.
   // This results in an array of three numbers: [m, f, r].
   var ary = x . split ( " " ) . map ( Number ) ;


   // Assign the numerical values to descriptive variable names.
   var m = ary [ 0 ] ; // Midterm score
   var f = ary [ 1 ] ; // Final score
   var r = ary [ 2 ] ; // Retake score


   // Initialize the grade variable to 'F' (Fail) by default.
   var ans = "F" ;


   // --- Grade Calculation Logic Starts Here ---

   // Special condition for 'F': if both midterm and final scores are -1.
   if ( m == -1 && f == -1 )
   {
      ans = "F" ;
   }
   // If the sum of midterm and final is 80 or more, assign 'A'.
   else if ( m + f >= 80 )
   {
      ans = "A" ;
   }
   // If the sum of midterm and final is 65 or more, assign 'B'.
   else if ( m + f >= 65 )
   {
      ans = "B" ;
   }
   // If the sum of midterm and final is 50 or more, assign 'C'.
   else if ( m + f >= 50 )
   {
      ans = "C" ;
   }
   // If the sum of midterm and final is 30 or more, AND retake is 50 or more, assign 'C'.
   else if ( m + f >= 30 && r >= 50 )
   {
      ans = "C" ;
   }
   // If the sum of midterm and final is 30 or more (and previous conditions not met), assign 'D'.
   else if ( m + f >= 30 )
   {
      ans = "D" ;
   }
   // If none of the above conditions are met, 'ans' remains 'F' as initialized.

   // Print the determined grade to the console.
   console . log ( ans ) ;
}

// End of the program's execution.