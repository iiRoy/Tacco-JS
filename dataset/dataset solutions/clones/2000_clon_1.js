/*
 * This is a JavaScript program that processes some input.
 * It reads three numbers, performs specific swaps, and then prints them.
 */
function main(   input    )  { // Entry point function

    // Split the input string into an array of arguments based on spaces.
    const   args    =    input.split(' ');


    // Parse the first argument as an integer and assign it to 'a'.
    let a   =   parseInt(   args[0] ,   10  )   ;
    // Parse the second argument as an integer and assign it to 'b'.
    let b   =   parseInt(   args[1] ,   10  )   ;
    // Parse the third argument as an integer and assign it to 'c'.
    let c   =   parseInt(   args[2] ,   10  )   ;


    /*
     * Perform the first swap:
     * Exchange the values of 'a' and 'b'.
     * This uses array destructuring assignment.
     */
    [ a , b ]   =   [ b , a ]   ;

    // Perform the second swap:
    // Exchange the values of 'a' and 'c'.
    [ a , c ]   =   [ c , a ]   ;


    // Log the final values of a, b, and c to the console,
    // separated by spaces.
    console.log(   `${a} ${b} ${c}`    )   ;

} /* End of main function */


// Call the main function with input read from standard input.
// This reads the entire file content as a UTF-8 string.
main(   require('fs')   .   readFileSync(   '/dev/stdin'    ,   'utf8'  )   )   ;