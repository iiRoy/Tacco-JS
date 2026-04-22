function   Main   (   input   )    {   // This is the primary function responsible for processing the input.

    // The input string is first split into an array of strings based on newline characters.
    input   =   input.split   (   "\n"   )   ;

    // The first line of the input array is extracted, and any leading/trailing whitespace is removed.
    var   S   =   input   [   0   ]   .   trim   (   )   ;

    // Initialize 'previous' with the very first character of the processed string 'S'.
    var   previous   =   S   [   0   ]   ;

    // A counter is set up to keep track of instances where adjacent characters are different.
    var   counter   =   0   ;


    /*
     * This loop iterates through the string 'S' from the second character onwards.
     * It compares each character with its immediate predecessor.
     */
    for   (   var   i   =   1   ;   i   <   S.length   ;   i   ++   )   {

        // Check if the current character is not identical to the 'previous' character.
        if   (   previous   !==   S   [   i   ]   )   {

            // If a difference is found, increment the 'counter'.
            counter   ++   ;
        }

        // Update 'previous' to the current character for the next iteration of the loop.
        previous   =   S   [   i   ]   ;
    }

    // Output the final count of differing adjacent characters to the console.
    console   .   log   (   counter   )   ;

}   // End of the Main function.


//    ---   DO   NOT   MODIFY   THE   FOLLOWING   SECTION   ---    //
// This part is responsible for standard input/output handling.
// It reads all data from standard input asynchronously and then calls the Main function.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;