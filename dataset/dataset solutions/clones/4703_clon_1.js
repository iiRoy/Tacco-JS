/*
 * This JavaScript function processes two numerical inputs
 * to calculate a specific result based on a set of rules.
 * The primary goal is to demonstrate a Type I code clone.
 */
function   Main   (   input   )   {

    // Split the incoming 'input' string by space to get an array of string numbers.
    var   inputArr   =   input .   split   (   ' '   )   ;

    // Convert the first element of the input array to a number and store it as 'sNum'.
    var   sNum   =   Number   (   inputArr   [   0   ]   )   ;

    // Convert the second element of the input array to a number and store it as 'cNum'.
    var   cNum   =   Number   (   inputArr   [   1   ]   )   ;

    // Initialize a variable 'result' to hold the final calculated value, starting at zero.
    var   result   =   0   ;

    // The following block calculates combinations, potentially involving 'sNum' and 'cNum'.
    // This logic branch determines how 'sNum' is utilized in the calculation.
    if   (   sNum   >   (   cNum   /   2   )   )   {

        // If 'sNum' is greater than half of 'cNum', then add half of 'cNum' (rounded down) to 'result'.
        result   +=   Math .   floor   (   cNum   /   2   )   ;

    }   else   {

        // Otherwise (if 'sNum' is less than or equal to half of 'cNum'),
        // add the full value of 'sNum' to the 'result'.
        result   +=   sNum   ;

        // Adjust 'cNum' by subtracting twice the current 'result'.
        cNum   -=   result   *   2   ;

        // Add a quarter of the remaining 'cNum' (rounded down) to the 'result'.
        result   +=   Math .   floor   (   cNum   /   4   )   ;

    }

    // Print the final computed 'result' to the console.
    console .   log   (   result   )   ;
}


// An example of how the 'Main' function might be called with hardcoded values,
// though this specific line is typically commented out in competitive programming.
// Main ( "12345 678901" ) ; // This line serves as a testing example.


// Execute the 'Main' function using input read from standard input.
// This is typical for competitive programming environments.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;