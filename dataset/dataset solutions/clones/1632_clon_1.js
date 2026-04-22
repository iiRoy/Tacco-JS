/*
 * This is an immediately invoked async function expression (IIFE).
 * It encapsulates the main logic of the script, ensuring that
 * all variables and functions declared within it are scoped locally.
 */
( async    (  )   =>    {

    // Declare and initialize an empty string variable named 'input'.
    // This variable will be used to accumulate data read from standard input.
    let   input    =    ''   ;

    // Use a 'for await...of' loop to asynchronously read data chunks
    // from 'process.stdin', which represents the standard input stream.
    // Each 'chunk' received is appended to the 'input' string.
    for    await    (    const   chunk   of   process  .  stdin    )
    {
        input    +=    chunk   ;   // Concatenate the current chunk to the 'input' string.
    }


    // After reading all input, split the accumulated 'input' string
    // into an array of substrings. The splitting is done using a
    // regular expression '/\s/', which matches any whitespace character.
    // The resulting array is stored in a constant variable named 'values'.
    const   values    =   input   .   split   (   / \s /   )   ;


    // Extract the first element from the 'values' array using 'shift()'.
    // The unary plus operator '+' is used to convert this string element to a number.
    // This number is then stored in a constant variable named 'n'.
    const   n    =   + values   .   shift   ( )   ;


    // Access the first element remaining in the 'values' array (at index 0).
    // Split this string into an array of individual characters using 'split('')'.
    // Then, take a slice of this character array from the beginning up to 'n' characters.
    // This resulting character array is stored in a mutable variable named 'c'.
    let   c    =   values   [   0   ]   .   split   (   ''   )   .   slice   (   0   ,   n   )   ;



    // Initialize a counter variable named 'count' to 0.
    // This variable will keep track of the number of swaps performed.
    let   count    =   0   ;


    // Start an infinite 'while' loop. The loop will continue
    // indefinitely until an explicit 'break' statement is encountered.
    while    (   true   )
    {
        // Find the index of the last occurrence of the character 'R' (for Red)
        // within the character array 'c'. If 'R' is not found, it returns -1.
        const   lastRed    =   c   .   lastIndexOf   (   'R'   )   ;

        // Find the index of the first occurrence of the character 'W' (for White)
        // within the character array 'c'. If 'W' is not found, it returns -1.
        const   firstWhite    =   c   .   indexOf   (   'W'   )   ;


        // Check the first termination condition:
        // If the last 'R' is found at an index *before* the first 'W',
        // it means all 'R's are already to the left of all 'W's,
        // so no more swaps are needed.
        if    (   lastRed   <   firstWhite   )
        {
            break   ;   // Exit the 'while' loop.
        }

        // Check the second termination condition:
        // If 'lastRed' is -1, it means there are no 'R' characters left in the array.
        // Therefore, no more swaps involving 'R' can be performed.
        if    (   lastRed   ==   -1   )
        {
            break   ;   // Exit the 'while' loop.
        }

        // Check the third termination condition:
        // If 'firstWhite' is -1, it means there are no 'W' characters left in the array.
        // Therefore, no more swaps involving 'W' can be performed.
        if    (   firstWhite   ==   -1   )
        {
            break   ;   // Exit the 'while' loop.
        }


        // If none of the termination conditions were met, perform a swap.
        // Replace the character at 'lastRed' index with 'W'.
        c   [   lastRed   ]    =   'W'   ;

        // Replace the character at 'firstWhite' index with 'R'.
        // This effectively swaps the positions of the 'R' and 'W'.
        c   [   firstWhite   ]    =   'R'   ;

        // Increment the 'count' variable to record that a swap has occurred.
        count   ++   ;
    }

    // After the 'while' loop terminates, print the final value of 'count'
    // to the standard output (console). This value represents the total
    // number of swaps performed to sort the characters.
    console   .   log   (   count   )   ;

} )   (   )   ; // End of the immediately invoked async function expression.