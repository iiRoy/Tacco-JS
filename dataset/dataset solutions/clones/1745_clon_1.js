/*
 * This JavaScript function implements a custom base-26 conversion algorithm.
 * It's designed to convert a given positive integer into a string sequence
 * using the lowercase English alphabet, similar to how spreadsheet column
 * headers work (e.g., 1=A, 26=Z, 27=AA, etc.).
 */
function main  (  input  )   {

    // Initialize 'N' by parsing the input string into a base-10 integer.
    // This 'N' is the number we will convert.
    let   N   =   parseInt  (  input  ,   10  )  ;

    // Define the alphabet string. This string serves as our lookup table
    // for digits in the base-26 system.
    let   alphabet   =   "abcdefghijklmnopqrstuvwhyz"  ;

    // Initialize 'result' as an empty string. This will accumulate
    // the characters of our base-26 representation in reverse order.
    let   result   =   ""  ;


    // The main loop continues as long as 'N' is greater than zero.
    // In each iteration, we extract one "digit" (character) from 'N'.
    while   (  0   <   N  )   {

        // Calculate the remainder when 'N' is divided by 26.
        // This remainder 'M' represents the current "digit" in our custom base-26 system.
        let   M   =   N   %   26  ;

        // Special handling for the case where 'M' is 0.
        // In this system, 0 typically maps to 'Z' (the 26th character),
        // and the division logic needs adjustment for this.
        if   (  M   ===   0  )   {
            M   =   26  ; // If remainder is 0, it means the digit is 'Z' (value 26).
        }

        // Prepend the character corresponding to 'M' to the 'result' string.
        // We use 'M - 1' because 'alphabet' is 0-indexed (a=0, b=1, ..., z=25),
        // but 'M' is 1-indexed (A=1, B=2, ..., Z=26).
        result   =   alphabet  .  substr  (  M   -   1  ,   1  )   +   result  ;

        // Update 'N' for the next iteration.
        // We subtract 'M' (the value of the current digit) and then divide by 26
        // to get the remaining part of the number, effectively shifting to the next "place value".
        N   =   (  N   -   M  )   /   26  ;

    } // End of while loop


    // After the loop finishes, 'result' contains the final base-26 string.
    // This line prints the result to the standard output.
    console  .  log  (  result  )  ;
}

// This section handles the input reading for the 'main' function.
// It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string.
// This is a common pattern in competitive programming environments.
main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,   "utf8"  )  )  ;

/*
 * The following line is a commented-out example of how to call 'main'
 * with a hardcoded string input for local testing purposes.
 * main("1111");
 */