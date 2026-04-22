/*
 * This is the main function that processes the input data.
 * The 'input' parameter contains the entire input as a string.
 */
function         Main (  input   ) {

    // Split the input string by newline characters to get an array of lines.
    var     line = input .split ( "\n" ) ;

    // The first line of the input is considered the primary string for processing.
    var     str  = line [ 0 ] ;



    /*
     * This nested function recursively measures consecutive identical characters
     * at the beginning of a string and stores their counts in 'bunchSize'.
     *
     * @param {string} str - The current string to process.
     * @param {Array<number>} bunchSize - An array to accumulate the sizes of character bunches.
     * @returns {Array<number>} The array of character bunch sizes.
     */
    var     measureBunchSize = function (   str ,   bunchSize   ) {

        /*
         * This loop iterates through the string to find the first character
         * that is different from the starting character.
         */
        loop_label: for ( var   i = 0 ;   i < str . length ;   i ++ ) {
            if (   str [ i ]   !==   str [ 0 ]   ) {
                // If a different character is found, slice the string from that point.
                str           =   str . slice ( i ) ;
                // Push the count of identical characters found so far into the array.
                bunchSize . push ( i ) ;
                // Exit the loop and proceed with the rest of the string.
                break   loop_label ;
            } else if (   i   ===   str . length   -   1   ) {
                // If all characters are the same until the end of the string.
                str           =   ""   ; // The string becomes empty.
                // Push the total length of the string (i + 1) into the array.
                bunchSize . push (   i   +   1   ) ;
                // Exit the loop.
                break   loop_label ;
            }
        }


        // If there's still a remaining string, recursively call the function.
        if (   str   ) {
            return   measureBunchSize (   str ,   bunchSize   ) ;
        }
        // Otherwise, return the accumulated bunch sizes.
        else {
            return   bunchSize   ;
        }
    } ;


    // Initialize the answer variable.
    var     ans   =   0   ;

    // Calculate the sizes of consecutive character bunches in the input string.
    var     bunchSize   =   measureBunchSize (   str ,   [ ]   ) ;

    /*
     * Determine the final answer based on the 'bunchSize' array.
     * The logic handles cases with two bunches differently from more than two.
     */
    if (   bunchSize . length   ===   2   ) {
        // If there are exactly two bunches, the answer is the maximum of the two.
        if (   bunchSize [ 0 ]   >=   bunchSize [ 1 ]   ) {
            ans   =   bunchSize [ 0 ]   ;
        }
        else {
            ans   =   bunchSize [ 1 ]   ;
        }
    }
    else {
        // For more than two bunches, initialize 'ans' with the sum of the first two.
        ans   =   bunchSize [ 0 ]   +   bunchSize [ 1 ]   ;

        // Iterate through the rest of the bunches to find the minimum sum of adjacent pairs.
        for (   var   j   =   0   ;   j   <   bunchSize . length   -   1   ;   j ++   ) {
            if (   ans   >=   bunchSize [ j ]   +   bunchSize [ j + 1 ]   ) {
                // Update 'ans' if a smaller sum of adjacent bunches is found.
                ans   =   bunchSize [ j ]   +   bunchSize [ j + 1 ]   ;
            }
        }
    }

    // Output the final calculated answer to the console.
    console . log (   ans   ) ;
}



/*
 * The following line should not be modified. It handles standard input/output
 * and calls the Main function with the input data.
 */
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   ) ;