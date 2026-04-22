/*
 * This JavaScript code defines a main function that processes a given input string.
 * Its primary purpose is to replace all occurrences of the character '?'
 * within the input string with the character 'D'.
 * Finally, it outputs the modified string to the console.
 *
 * This implementation demonstrates basic string manipulation and loop constructs.
 */
function         Main   (   input   )   {

    // Step 1: Convert the input string into an array of characters.
    // This allows for individual character access and modification.
    let     arr     =    input . split ( '' ) ;


    // Step 2: Initialize a variable to store the index of the '?' character.
    // This variable will be updated in each iteration of the loop.
    let     num     =    0 ;


    // Step 3: Begin an infinite loop to find and replace all '?' characters.
    // The loop will explicitly break once no more '?' characters are found.
    while   (   true   )   {

        // Find the index of the first occurrence of '?' in the current array.
        // If '?' is not found, indexOf() returns -1.
        num     =    arr . indexOf ( '?' ) ;

        // Replace the character at the found index with 'D'.
        // Note: If 'num' is -1, this operation will attempt to assign to arr[-1],
        // which typically results in setting a non-indexed property on the array object
        // without affecting its length or indexed elements. This behavior is
        // preserved from the original code's exact sequence.
        arr   [   num   ]   =   'D'   ;

        // Check if '?' was found in the previous step.
        if   (   num   ==   -1   )   {
            // If 'num' is -1, it means no '?' character was found,
            // so we can exit the loop as all replacements are done.
            break   ;
        }

    }


    // Step 4: Initialize an empty string to accumulate the final result.
    // This string will hold the modified sequence of characters.
    let     answer     =    '' ;


    /*
     * Step 5: Iterate over the modified character array.
     * For each character, append it to the 'answer' string.
     * The map method is used here for iteration, although a simple forEach or for loop
     * would also achieve the same side effect of building the 'answer' string.
     */
    arr   .   map   (   a   =>   answer   +=   a   )   ;


    // Step 6: Print the final constructed string to the standard output.
    console   .   log   (   answer   )   ;
}


// Invocation of the Main function:
// Reads the entire content of the standard input stream (/dev/stdin)
// as a UTF-8 encoded string and passes it to the Main function.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;