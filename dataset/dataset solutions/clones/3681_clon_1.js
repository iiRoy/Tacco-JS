"use strict";/* This directive enforces strict mode for the entire script.
                  It helps in writing cleaner code by catching common mistakes and "unsafe" actions. */


const   main    =    (   arg   )  =>   {
    // The main function processes the input string.

    arg   =   arg . trim ( ) . split ( "\n" ) ; /* First, remove leading/trailing whitespace,
                                                 then split the string by newline characters
                                                 to get an array of lines. */


    const   S   =   arg  [  0  ] . split ( "" ) ; // Extract the first line and split it into an array of characters.

    const   W   =   parseInt (   arg  [  1  ]   ) ; // Extract the second line and parse it as an integer.


    let   answer   =   [   ] ; /* Initialize an empty array to store the resulting characters.
                                  This array will hold the characters that satisfy the condition. */


    // Loop through each character index in the input string S.
    for   (   let   i   in   S   )   {
        /* Check if the current index 'i' is a multiple of 'W'.
           The '===' operator ensures strict equality (value and type). */
        if   (   i   %   W   ===   0   )   {
            answer . push (   S [   i   ]   ) ; // If the condition is met, add the character at index 'i' to the 'answer' array.
        }
    }


    console . log (   answer . join ( "" )   ) ; /* Join all characters in the 'answer' array to form a single string,
                                                   then print it to the console. */
}


// Call the main function with the content of /dev/stdin as input.
main   (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;