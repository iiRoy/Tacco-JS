/*
 * This JavaScript file processes three numerical inputs:
 * Distance (D), Time (T), and Speed (S).
 * It determines if the given distance D can be covered
 * within the specified time T, assuming a constant speed S.
 *
 * The logic is straightforward: calculate the time needed (D/S)
 * and compare it with the available time T.
 *
 * This implementation is a Type I clone, meaning only
 * whitespace and comments have been altered from an original version.
 */


const   main    =   input   =>  {
    // The input string is expected to contain three space-separated values.
    // These values are parsed into constants D, T, and S.
    const   [D, T, S]   =   input.split  (  " "  )   ;

    // We check if the available time T is sufficient to cover the distance D
    // at speed S. The required time is D divided by S.
    if  (   T   >=  (   D   /   S   )   )   {
        // If the available time is greater than or equal to the required time,
        // it means the distance can be covered.
        console.log   (   "Yes"   )   ;
    }   else    {
        // Otherwise, the available time is insufficient.
        console.log   (   "No"    )   ;
    }
}   ;


// This part of the code handles reading the input data.
// It uses Node.js's 'fs' module to synchronously read from standard input.
// The content is read as a UTF-8 encoded string and passed to the 'main' function.
main    (
    require (   'fs'   )
        .   readFileSync    (
            '/dev/stdin',
            'utf8'
        )
)   ;
// End of program execution.