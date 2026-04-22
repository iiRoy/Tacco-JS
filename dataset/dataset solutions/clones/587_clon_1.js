/*
 * This JavaScript code defines a function 'bomb'
 * and then processes some input to find a minimum length.
 * It's designed to solve a specific string manipulation problem.
 */


function   bomb  (  x  )
{
    // Initialize a variable L to track string length changes
    var   L   =   0  ;

    /*
     * Loop as long as the length of x changes.
     * This loop attempts to reduce the string x by removing
     * specific repeating patterns (1111+, 2222+, 3333+).
     */
    while (   L   !=   x  .  length   )
    {
        L   =   x  .  length  ;  // Update L with the current length of x

        // Replace any sequence of four or more '1's, '2's, or '3's with an empty string
        x   =   x  .  replace  (  /1111+|2222+|3333+/  ,  ""  )  ;
    }

    // After reduction, compare the length of x with the current minimum
    if   (   min   >   x  .  length   )
    {
        min   =   x  .  length  ;  // Update min if a smaller length is found
    }
}


// Read input from standard input
var input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;

// Trim whitespace and split the input by newlines into an array
var   Arr   =   (   input  .  trim ( )   ) . split ( "\n" ) ;


// Main processing loop
while   (   true   )
{
    // Shift the first element from Arr, convert to number, and store in N
    var   N   =   Arr  .  shift ( )   -   0  ;

    // If N is 0, it signifies the end of input, so break the loop
    if   (   N   ==   0   )
    {
        break  ;
    }


    // Initialize an empty array to store numbers for the current test case
    var   arr   =   [ ]  ;

    // Populate 'arr' with N numbers from the input
    for   (   var   i   =   0  ;   i   <   N  ;   i  ++   )
    {
        var   v   =   Arr  .  shift ( )   -   0  ; // Get next number from input
        arr  .  push (   v   )  ;                 // Add it to 'arr'
    }

    // Initialize 'min' to a very large value (Infinity) for finding minimum length
    var   min   =   Infinity  ;

    // Join the numbers in 'arr' to form a single string
    var   str   =   arr  .  join ( "" )  ;


    // Loop through the numbers in 'arr' to perform operations
    for   (   var   i   =   0  ;   i   <   N  ;   i  ++   )
    {
        // Case 1: If i is within bounds (always true here, but original logic kept)
        // Simulate replacing arr[i] with arr[i+1] (effectively removing arr[i] and shifting arr[i+1] to its place)
        if   (   i   <   N   )
        {
            bomb (   str  .  slice (   0  ,   i   )   +   arr  [   i  +  1   ]   +   str  .  slice (   i  +  1  ,   str  .  length   )   )  ;
        }

        // Case 2: If i is not the first element
        // Simulate replacing arr[i] with arr[i-1] (effectively removing arr[i] and shifting arr[i-1] to its place)
        if   (   i   >   0   )
        {
            bomb (   str  .  slice (   0  ,   i   )   +   arr  [   i  -  1   ]   +   str  .  slice (   i  +  1  ,   str  .  length   )   )  ;
        }
    }


    // Print the calculated minimum length for the current test case
    console  .  log (   min   )  ;
}