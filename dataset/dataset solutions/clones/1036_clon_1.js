/*
 * This JavaScript code defines a main function to process input.
 * It's designed to read two lists of numbers and count how many
 * elements from the first list are present in the second list.
 * The input is expected to be provided via standard input.
 */


function     Main   (   input   )

{
    // The raw input string is first split into an array of lines.
    input = input.split("\n")   ;


    /*
     * The first number 'n' represents the size of the first array.
     * It's parsed from the very first line of the input.
     */
    var   n   =   parseInt   (   input   [   0   ]   ,   10   )   ;

    // The second number 'q' represents the size of the second array.
    // This value is extracted from the third line of the input.
    var   q   =   parseInt   (   input   [   2   ]   ,   10   )   ;


    // The actual number lists are on the second and fourth lines.
    // They are split by spaces to form temporary string arrays.
    input   [   1   ]   =   input   [   1   ]   .   split   (   " "   )   ;
    input   [   3   ]   =   input   [   3   ]   .   split   (   " "   )   ; /* Also process the fourth line */


    // Declare two arrays, 's' and 't', which will store the integer values.
    var   s   =   Array   (   n   )   ,   t   =   Array   (   q   )   ;


    // Loop to populate the 's' array with integer values.
    // Each string element from input[1] is converted to an integer.
    for   (   var   i   =   0   ;   i   <   n   ;   i   ++   )   {
        s   [   i   ]   =   parseInt   (   input   [   1   ]   [   i   ]   ,   10   )   ;
    }   //   End   of   first   population   loop


    // Loop to populate the 't' array, similar to the 's' array.
    // Elements are taken from input[3] and parsed as integers.
    for   (   var   i   =   0   ;   i   <   q   ;   i   ++   )   {
        t   [   i   ]   =   parseInt   (   input   [   3   ]   [   i   ]   ,   10   )   ;
    }   /*   End   of   second   population   loop   */


    // Initialize a counter to keep track of matching elements.
    var   count   =   0   ;


    // Begin nested loops to compare every element of 's' with every element of 't'.
    for   (   var   i   =   0   ;   i   <   n   ;   i   ++   )   {
        for   (   var   j   =   0   ;   j   <   q   ;   j   ++   )   {
           // If an element from 's' is equal to an element from 't', increment the counter.
           // The boolean result of (s[i] == t[j]) is implicitly converted to 0 or 1.
           count   +=   (   s   [   i   ]   ==   t   [   j   ]   )   ;
        }   //   Inner   loop   completes   its   iteration
    }   //   Outer   loop   finishes   all   its   iterations


    // Finally, print the total count of matches to the console.
    console   .   log   (   count   )   ;
}   /*   End   of   the   Main   function   definition   */


// This part of the code is responsible for reading input from standard input
// and then calling the Main function with the retrieved data.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;