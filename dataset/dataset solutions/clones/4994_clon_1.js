/*
 * This JavaScript file enforces strict parsing and execution rules.
 * It's designed to process input from standard input.
 */
'use strict'
;


const   lines   =   require ( "fs" ) .  readFileSync ( "/dev/stdin" ,   "utf8" ) .  split ( "" )
; /* Read all input characters from standard input, splitting into an array of individual characters. */


let     answer  =   "Yes"
; // Initialize the default outcome to "Yes". This will be changed to "No" if any character count is odd.


/*
 * Iterate through each character in the 'lines' array using a standard for loop.
 * The primary objective is to verify if every character within the input appears an even number of times.
 */
for  (   let   i   =   0
;   i   <   lines . length
;   i++   )
{
    let     count   =   0
    ; //   Initialize a counter variable for the current character being examined (lines[i]).

    //   Begin counting occurrences of the character at the current index 'i' across the entire input array.
    lines . forEach (   letter   =>
    {
        /*
         *   Perform a strict equality comparison between the character at the current outer loop index 'i'
         *   and the character iterated over by the inner forEach loop.
         */
        if  (   lines [ i ]   ===   letter   )
        {
            count++
            ; // Increment the counter if a precise match is identified.
        } //   End of the 'if' conditional block for character comparison.
    }
    )
    ; //   End of the 'forEach' loop, all characters have been checked against lines[i].


    //   Following the completion of counting, ascertain if the character appeared an odd number of times.
    if  (   count   %   2   ===   1   )
    {
        answer  =   "No"
        ; //   If the count is odd, the core condition is not satisfied, and the overall answer is set to "No".
        break
        ; //   Terminate the outer loop immediately as the condition has already been violated, no need for further checks.
    } //   End of the 'if' conditional block for checking odd counts.
} //   End of the outer 'for' loop, all unique characters have been processed or a violation was found.


console . log ( answer )
; //   Output the final determination (either "Yes" or "No") to standard output.
// Script execution concludes at this point.