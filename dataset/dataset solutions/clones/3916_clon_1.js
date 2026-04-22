/*
 * This is a JavaScript program designed to process an input string,
 * extract three integer values, and then generate a sorted list
 * of numbers based on specific criteria.
 * The program then prints each number in the generated list to the console.
 *
 * The primary function is 'main', which takes the raw input string.
 */
function   main (   input   ) {
    // Begin processing the input.
    // First, remove any leading or trailing whitespace from the input string.
    input =   input.trim ( )   ;

    // Declaration and initialization of 'a'.
    // It parses the first space-separated token from the trimmed input as an integer.
    // The radix (base) 10 is explicitly specified for parseInt to ensure decimal interpretation.
    const   a   =   parseInt (   input.split ( " " ) [   0   ]   ,   10   )   ;

    // Declaration and initialization of 'b'.
    // Similar to 'a', it parses the second space-separated token.
    const   b   =   parseInt (   input.split ( " " ) [   1   ]   ,   10   )   ;

    // Declaration and initialization of 'k'.
    // This variable holds the third integer value from the input.
    const   k   =   parseInt (   input.split ( " " ) [   2   ]   ,   10   )   ;


    // Initialize an empty array named 'arr'. This array will store the generated numbers.
    var   arr   =   [ ]   ;

    // First loop: Populate 'arr' with numbers starting from 'a'.
    // It iterates 'k' times.
    for   (   var   i   =   0   ;   i   <   k   ;   i   ++   )   {
        // Check if the current number (a + i) is within the bounds, i.e., less than or equal to 'b'.
        if   (   a   +   i   <=   b   )   {
            // If the condition is met, add the number to the 'arr' array.
            arr.push (   a   +   i   )   ;
        }
    }


    // Second loop: Further populate 'arr' with numbers counting down from 'b'.
    // This loop also runs 'k' times.
    for   (   var   i   =   0   ;   i   <   k   ;   i   ++   )   {
        // Calculate the potential number to add: (b - i).
        // Check if this calculated number is NOT already present in the 'arr' array.
        if   (   arr.indexOf (   b   -   i   )   ==   -1   )   {
            // If the number is unique (not found in 'arr'), then perform another check.
            // Ensure that 'a' is less than or equal to the current number (b - i).
            if   (   a   <=   b   -   i   )
            {
                // If both conditions are satisfied (unique and within range), add the number.
                arr.push (   b   -   i   )   ;
            }
        }
    }


    // Sort the 'arr' array numerically in ascending order.
    // A custom comparison function is provided to ensure correct numerical sorting,
    // as the default sort is lexicographical.
    arr.sort (   function   (   a   ,   b   )   {
        // If 'a' is strictly less than 'b', 'a' should come before 'b'.
        if   (   a   <   b   )   return   -1   ;
        // If 'a' is strictly greater than 'b', 'a' should come after 'b'.
        if   (   a   >   b   )   return   1   ;
        // If 'a' and 'b' are equal, their relative order does not change.
        return   0   ;
    }   )   ;


    // Final loop: Iterate through the now sorted array.
    // Print each element of the array to the console on a new line.
    for   (   var   i   =   0   ;   i   <   arr.length   ;   i   ++   )   {
        // Output the current element.
        console.log (   arr [   i   ]   )   ;
    }
}


// This is the entry point for the script when executed in a Node.js environment.
// It reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string.
// The read content is then passed as an argument to the 'main' function.
main (   require (   'fs'   ) .   readFileSync (   '/dev/stdin'   ,   'utf8'   )   )   ;