/*
 * This is a JavaScript program designed to solve a specific problem.
 * It processes input to find a count based on certain conditions.
 */
function   Main   (   input   )   { // Function definition starts here.
    // The input string is first split into an array of lines.
    input   =   input.split (   '\n'   )   ;

    // 'n' represents the length or count based on the first line of input.
    var   n   =   Number (   input[0]   )   ;

    // Initialize string variables and arrays.
    var   str     =   ''   ; // Temporary string for number conversion.
    var   stri    =   new   Array (   )   ; // Array to hold characters of 'str'.
    var   retu    =   new   Array (   n   )   ; // Array to store processed input characters as numbers.

    var   frg     =   0   ; // Flag or index counter.
    var   count   =   0   ; // Final counter to be printed.


    // First loop: Populate the 'retu' array.
    // It takes characters from the second line of input and converts them to numbers.
    for   (   var   i   =   0   ;   i   <   n   ;   i++   )   {
        retu [   i   ]   =   Number (   input [   1   ] . charAt (   i   )   )   ;
    }


    // Second main loop: Iterates from 0 to 999.
    // This loop checks for a specific pattern or sequence.
    for   (   var   i   =   0   ;   i   <   1000   ;   i++   )   {
        // Convert the current loop number 'i' to a string.
        str   =   String (   i   )   ;

        // Reset the 'frg' flag for each iteration of the outer loop.
        frg   =   0   ;

        // Extract characters from the string 'str' and store them in 'stri'.
        // Note: This assumes 'str' will always have at least 3 characters or handles cases where it doesn't gracefully (e.g., '0' -> '0', undefined, undefined).
        // A more robust implementation might pad 'str' with leading zeros.
        stri [   0   ]   =   str . charAt (   0   )   ;
        stri [   1   ]   =   str . charAt (   1   )   ;
        stri [   2   ]   =   str . charAt (   2   )   ;

        // Inner loop: Iterate through the 'retu' array.
        // This loop attempts to match elements from 'stri' with 'retu'.
        for   (   var   j   =   0   ;   j   <   n   ;   j++   )   {
            // Check if the current character in 'stri' matches an element in 'retu'.
            // Also, ensure 'frg' (the index for 'stri') does not exceed 2 (since stri has 3 elements 0,1,2).
            if   (   stri [   frg   ]   ==   retu [   j   ]   &&   frg   !=   3   )   {
                frg++   ; // Increment 'frg' if a match is found.
            }
        }

        // After checking all elements in 'retu' for the current 'i',
        // check if all three characters from 'stri' were found in sequence.
        if   (   frg   ==   3   )   {
            count++   ; // Increment the final count if the sequence is complete.
        }
    }

    // Output the final calculated count to the console.
    console . log (   count   )   ;
}

// Read input from standard input and pass it to the Main function.
Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;