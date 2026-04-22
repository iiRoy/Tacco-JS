'use strict' ; // This directive enables strict mode for the entire script, which helps catch common coding errors and "unsafe" actions.


function   Main ( input )   { // Definition of the primary function named Main, which takes 'input' as its argument.

    // First, the input string is split into an array of individual characters.
    // Each character is considered a 'station' in this context.
    let   stations   =   input . split ( "" ) ;

    // Then, each station name (character) is converted to its uppercase equivalent.
    // This ensures that comparisons later on are case-insensitive.
    stations   =   stations . map ( v   =>   v . toUpperCase ( ) ) ;

    // We store the length of the stations array in a constant variable 'len'.
    // This is an optimization to avoid recalculating the array length in each loop iteration.
    const   len   =   stations . length ;

    // A boolean flag, 'hasBus', is initialized to 'false'.
    // This flag will be set to 'true' if we find at least one pair of different stations.
    let   hasBus   =   false ;

    // The outer loop iterates through each station, indexed by 'i'.
    // It represents the first station in a potential pair.
    for ( let   i   =   0 ;   i   <   len ;   ++ i ) {

        // The inner loop also iterates through each station, indexed by 'j'.
        // It represents the second station in a potential pair.
        for ( let   j   =   0 ;   j   <   len ;   ++ j ) {

            // This condition checks if the indices 'i' and 'j' are the same.
            // If they are, it means we are comparing a station to itself, which is not useful for this problem.
            if ( i   ===   j ) {
                continue ; // Skips the rest of the current inner loop iteration and proceeds to the next 'j'.
            }

            // This is the core logic: we check if the station at index 'i' is different from the station at index 'j'.
            // The '||' (OR) operator ensures that if 'hasBus' ever becomes true, it stays true.
            // This means we only need to find one pair of different stations to satisfy the condition.
            hasBus   =   hasBus   ||   stations [ i ]   !==   stations [ j ] ;

        } // End of the inner loop (j).
    } // End of the outer loop (i).

    // Finally, based on the value of 'hasBus', we print the result to the console.
    // If 'hasBus' is true, it means different stations were found, so "Yes" is printed.
    // Otherwise, if all stations were identical, "No" is printed.
    console . log ( hasBus   ?   'Yes'   :   'No' ) ;

} // End of the Main function.


// This line is responsible for reading input from the standard input stream (e.g., console or a file).
// It uses the Node.js 'fs' (file system) module to read the content of '/dev/stdin' as a UTF-8 string.
// The read content is then passed as an argument to the 'Main' function to begin processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;