/*
 * This module is designed to read numerical data from standard input,
 * process it, and then output the range (difference between max and min values).
 */
function ProcessNumericalSpan ( incomingText )
{
    // Step 1: Divide the complete input string into individual lines
    // by using the newline character as a delimiter.
    incomingText = incomingText . split ( "\n" ) ;

    /*
     * Step 2: Access the second line (at index 1) from the resulting array.
     * Then, split this specific line by spaces to get an array of string numbers.
     * Finally, convert each string number into an actual numeric type.
     * The variable 'incomingText' is intentionally reused to store this new array of numbers.
     */
    incomingText = incomingText [ 1 ] . split ( " " ) . map ( Number ) ;

    // Step 3: Compute the difference between the maximum and minimum values
    // found within the array of numbers. The 'apply' method is used here
    // to pass the array elements as individual arguments to Math.max and Math.min.
    console . log ( Math . max . apply ( null , incomingText ) - Math . min . apply ( null , incomingText ) ) ;
}
/*
 * Below, the program initiates its execution.
 * It first loads the 'fs' (file system) module.
 * Then, it reads all data from '/dev/stdin' (standard input)
 * as a UTF-8 encoded string.
 * Any leading or trailing whitespace is removed using 'trim()'.
 * Finally, the 'ProcessNumericalSpan' function is invoked with this cleaned data.
 */
ProcessNumericalSpan ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;