/*
 * This JavaScript file processes student scores from standard input.
 * It reads lines, parses scores, and assigns a rank based on specific criteria.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Purpose: Demonstrate Type I code cloning - only whitespace and comments altered.
 */

// Import the 'fs' (file system) module to read input.
var input = require( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the raw input: trim whitespace and split into an array of lines.
// The /\n/g regex ensures all newline characters are used as delimiters.
var lines = ( input.trim ( ) ) . split ( /\n/g ) ;


// Declare a variable to hold the calculated rank for each student.
var rank ;


// Begin iterating through each line of input data.
// The loop continues as long as 'i' is less than the total number of lines.
for ( var i = 0 ; i < lines.length ; i ++ )
{
    // Check for the termination condition: a line containing exactly "-1 -1 -1".
    if ( lines [ i ] === '-1 -1 -1' )
        {
            // If the termination condition is met, exit the loop immediately.
            break ;
        }


    // Parse the current line:
    // 1. Split the line by spaces.
    // 2. Map each resulting string segment to a Number.
    var line = lines [ i ] . split ( ' ' ) . map ( Number ) ,
        // Extract the three score components into distinct variables.
        m    = line [ 0 ] , // Score for midterm
        f    = line [ 1 ] , // Score for final exam
        r    = line [ 2 ] ; // Score for re-examination


    // Evaluate the scores to determine the student's rank.

    // Condition 1: If either midterm or final score is -1, the rank is 'F'.
    if ( m === -1 || f === -1 )
        rank = 'F' ;
    // Condition 2: If the sum of midterm and final scores is 80 or more, the rank is 'A'.
    else if ( 80 <= m + f )
        rank = 'A' ;
    // Condition 3: If the sum of midterm and final scores is 65 or more, the rank is 'B'.
    else if ( 65 <= m + f )
        rank = 'B' ;
    // Condition 4: If the sum of midterm and final scores is 50 or more, the rank is 'C'.
    else if ( 50 <= m + f )
        rank = 'C' ;
    // Condition 5: If the sum of midterm and final scores is 30 or more, further check the re-examination score.
    else if ( 30 <= m + f )
    {
        // Sub-condition: If the re-examination score is 50 or more, the rank is 'C'.
        if ( 50 <= r )
            rank = 'C' ;
        // Otherwise, if re-examination is less than 50, the rank is 'D'.
        else
            rank = 'D' ;
    }
    // Final Condition: If none of the above conditions are met, the rank is 'F'.
    else
        rank = 'F' ;


    // Output the determined rank to the console.
    console.log ( rank ) ;
}

// End of script. All input lines processed.