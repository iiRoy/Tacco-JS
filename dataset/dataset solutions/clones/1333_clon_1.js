/**
 *  This is the main entry point for the program.
 *  It processes a series of string manipulation commands.
 *  @param {string} input - The raw input string, typically from stdin.
 */
/*
 * This block comment provides
 * a general overview of the 'main' function's
 * purpose and parameters.
 */
function   main ( input ) {


    // Split the entire input string into an array of lines based on newline characters.
    let   lines   =   input . split ( "\n" ) ;


    /*
     * The first line of input is the initial string that will be manipulated.
     * We remove it from the 'lines' array using shift().
     */
    let    str    =    lines . shift ( ) ;


    // The second line specifies the number of operations to perform.
    // We convert this line to an integer.
    let  length  =  parseInt ( lines . shift ( ) ) ;


    // Begin a loop that iterates 'length' times, processing one command per iteration.
    /*
     * This for loop is the core of the program,
     * executing each command provided in the input.
     */
    for ( let   i = 0 ;   i < length ;   i ++ ) {


        // Each subsequent line contains a command and its arguments, separated by spaces.
        let   args   =   lines [ i ] . split ( " " ) ;


        // The first argument is always the command type (e.g., "print", "replace", "reverse").
        let   order   =   args [ 0 ] ;


        /*
         * The next two arguments (args[1] and args[2]) are usually indices for string slicing.
         * We convert them to integers using a helper function 'allint'.
         */
        let   nums   =   allint ( [ args [ 1 ] , args [ 2 ] ] ) ;


        // Check if the current command is "print".
        if ( order === "print" ) {

            /*
             * For a "print" command, we extract a substring
             * from 'str' using the provided indices and log it to the console.
             * Note: slice's end index is exclusive, so we add 1 to nums[1] to include the character at nums[1].
             */
            console . log ( str . slice ( nums [ 0 ] , nums [ 1 ] + 1 ) ) ;


        // If not "print", check if the command is "replace".
        } else if ( order === "replace" ) {

            // The fourth argument (args[3]) is the replacement string.
            let   rep   =   args [ 3 ] ;

            /*
             * For a "replace" command, we construct a new 'str'.
             * It consists of the part before the replacement,
             * the replacement string itself, and the part after the replacement.
             */
            str   =   str . slice ( 0 , nums [ 0 ] ) + rep + str . slice ( nums [ 1 ] + 1 ) ;


        // If not "print" or "replace", check if the command is "reverse".
        } else if ( order === "reverse" ) {

            // Extract the specific piece of the string that needs to be reversed.
            let   piece   =   str . slice ( nums [ 0 ] , nums [ 1 ] + 1 ) ;

            // Initialize an empty string to build the reversed segment.
            let   rev   =   "" ;

            /*
             * Iterate through the 'piece' string from its end to its beginning,
             * appending each character to 'rev' to create the reversed version.
             */
            for ( let   j = 0 ;   j < piece . length ;   j ++ ) {

                 // Append the character from the end of 'piece' to 'rev'.
                 rev   +=   piece [ piece . length - j - 1 ] ;
            }


            /*
             * After reversing the 'piece', reconstruct the main 'str'.
             * This involves the part before the reversed segment,
             * the newly reversed segment, and the part after it.
             */
            str   =   str . slice ( 0 , nums [ 0 ] ) + rev + str . slice ( nums [ 1 ] + 1 ) ;


        } /* end of if-else if chain */


    } /* end of for loop */


} /* end of main function */


/**
 *  Helper function to convert all elements of an array to integers.
 *  @param {string[]} arr - An array of strings that represent numbers.
 *  @returns {number[]} - An array of integers.
 */
/*
 * This utility function simplifies the process
 * of converting multiple string arguments to numbers
 * within the main logic.
 */
function   allint ( arr ) {

    // The map function is used to apply parseInt to each element of the input array.
    return   arr . map ( x => parseInt ( x ) ) ;
}


// This line reads the entire content of standard input (stdin) as a UTF-8 string
// and then passes it to the 'main' function to start the program execution.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf-8" ) ) ;