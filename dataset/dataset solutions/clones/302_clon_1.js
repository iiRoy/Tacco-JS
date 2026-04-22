/*
 * This JavaScript code defines a function to check for leap years
 * and then processes a series of year ranges from standard input
 * to identify and print leap years within those ranges.
 *
 * It reads input line by line, where each line contains two years:
 * 'from' and 'to'. The loop continues until 'from' and 'to' are both zero.
 *
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered.
 */

// Function definition for checking leap years
function   isLeap  ( year )   {

    // A year is a leap year if it is divisible by 400.
    if   (  year  %  400   ==   0  )
        return   true ;
    else
    /* Otherwise, if it's divisible by 100, it's not a leap year. */
        if   (  year  %  100   ==   0  )
            return   false  ;
        else
            // If it's divisible by 4, it is a leap year (unless already excluded by 100/400 rules).
            if   (  year  %  4   ==   0  )
                return   true  ;
            else
                // All other years are not leap years.
                return   false   ;

} /* End of isLeap function */


// --- Main program execution starts here ---

// Require the 'fs' module for file system operations.
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;

// Split the input string by newline characters to get an array of lines.
var   lines   =   input . split ( '\n' ) ;


// Initialize a string to accumulate all results.
var   strAll   =   ''   ;


// Loop indefinitely until a specific break condition is met.
while   (  true  )   {

    // Retrieve the first line from the 'lines' array and split it by space.
    var   years   =   lines . shift ( ) . split ( ' ' ) ;

    // Convert the first part to a number, representing the start year.
    var   from   =   + years [ 0 ]   ;

    // Convert the second part to a number, representing the end year.
    var   to   =   + years [ 1 ]   ;


    // Check the termination condition: if both 'from' and 'to' are zero, exit the loop.
    if   (  from   +   to   ==   0  )
    {
        break   ; // Exit the while loop.
    }


    // Initialize a temporary string for the current range's leap years.
    var   str   =   ''   ;

    /*
     * Iterate through all years from 'from' to 'to' (inclusive).
     * This loop checks each year for the leap year condition.
     */
    for   (  var   i   =   from  ;   i   <=   to  ;   i ++  )   {

        // If the current year 'i' is a leap year...
        if   (  isLeap ( i )  )   {

            // Append the leap year followed by a newline to the temporary string.
            str   +=   i   +   '\n'   ;
        }
    }


    // If no leap years were found in the current range...
    if   (  str . length   ==   0  )   {

        // Append "NA" (Not Applicable) followed by a newline.
        str   +=   'NA\n'   ;
    }


    // Append the results of the current range (str) and an additional newline to the overall result.
    strAll   +=   str   +   '\n'   ;

} /* End of the main processing loop */


// The final string 'strAll' might have an extra newline at the end,
// and potentially one more from the 'str + \n' if the last block was 'NA\n'.
// This line removes the last two characters to ensure correct formatting
// (e.g., if the last appended was 'NA\n\n', it becomes 'NA\n').
strAll   =   strAll . substr ( 0 ,   strAll . length   -   2 )   ;

// Print the final accumulated string to the console (standard output).
console . log ( strAll ) ;