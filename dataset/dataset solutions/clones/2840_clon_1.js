'use strict' ; // Enforce strict mode for better error handling


function Main ( input ) { // Main entry point function, processes the given input

    // Splitting the input string into an array based on the space delimiter
    const temp = input . split ( " " ) ;
    const n = temp [ 0 ] ; // Extracting the first element as 'n'
    const k = temp [ 1 ] ; // Extracting the second element as 'k'

    let ans ; // Declaring a variable 'ans' to store the calculated answer


    // Conditional logic to determine the value of 'ans'
    if ( k == 1 ) { // Check if 'k' is strictly equal to 1
        ans = 0 ; // If 'k' is 1, set 'ans' to 0
    }
    else { // Otherwise (if 'k' is not 1)
        ans = n - k ; // Calculate 'n' minus 'k' and assign it to 'ans'
    }


    // Outputting the final calculated answer to the console
    console . log ( ans ) ;
} // End of the Main function definition


/*
 *  PLEASE DO NOT MODIFY THE FOLLOWING CODE BLOCK.
 *  This section is responsible for standard input/output handling
 *  and ensures the Main function is called correctly with the received data.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;