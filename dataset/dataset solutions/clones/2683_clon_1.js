/* This is a JavaScript program designed to solve a specific problem.
 * It processes an array of numbers representing heights and determines if a
 * specific condition related to these heights can be maintained throughout the sequence.
 */
function     Main  (   input   )    {
    // Declare a variable 'N' to store the total number of height elements.
    // It parses the first element of the input array, assuming it's the count,
    // as an integer with a base of 10.
    var     N   =   parseInt    (   input[0]    ,   10  )   ;


    /*
     * The variable 'H' will hold an array of actual height values.
     * It takes a slice of the input array starting from the second element (index 1),
     * and then maps each of these string elements to an integer, again using base 10.
     * This effectively converts the remaining input into an array of numbers.
     */
    var H = input . slice ( 1 ) . map ( h   =>  parseInt(h, 10) ) ;


    // 'current' tracks the current maximum height that is allowed at any given point
    // to satisfy the problem's condition. It is initialized with the first height.
    var current     =   H[0]    ;


    // Begin iterating through the heights array starting from the second element (index 1)
    // up to, but not including, the N-th element.
    for     (   i   =   1   ;   i   <   N   ;   i++     )   {

        // First condition check: If the current maximum allowed height is exactly
        // the same as the next height in the sequence.
        if  (   current     ===     H[i]    )   {
            // If they are equal, the current maximum allowed height remains unchanged.
            // This step is technically redundant but explicitly shows the state.
            current     =   H[i]    ;
        }   else    if  (   current     <=      H[i]    -   1   )   {
            // Second condition check: If the current maximum allowed height is less than
            // or equal to the next height minus one. This implies we can "reduce" the
            // next height by one to meet the current constraint.
            current     =   H[i]    -   1   ;
        }   else    {
            // If neither of the above conditions is met, it means we cannot maintain
            // the required condition (i.e., we would need to increase `current` to match
            // `H[i]` or `H[i]-1`, but `current` is already too high relative to `H[i]`).
            // In this scenario, we output 'No' and immediately terminate the function.
            return  console . log   (   'No'    )   ;
        } // End of the conditional block for processing a single height element

    }   // End of the 'for' loop that iterates through all heights

    // If the loop completes without the function returning 'No', it means that
    // the condition was successfully met for all elements in the heights array.
    // Therefore, we output 'Yes'.
    console . log   (   'Yes'   )   ;

}   // End of the Main function definition


// This section is responsible for the program's execution entry point.
// It reads input from the standard input stream ('/dev/stdin'), decodes it
// as a UTF-8 string, removes any leading or trailing whitespace, and then
// splits the string into an array of substrings using either newline characters
// or spaces as delimiters. This array is then passed as the 'input' argument
// to the 'Main' function to begin the problem-solving logic.
Main    (   require (   "fs"    )   .   readFileSync    (   "/dev/stdin"    ,   "utf8"  )   .   trim    (   )   .   split   (   /\n|\s/ )   )   ;