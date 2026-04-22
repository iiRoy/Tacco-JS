/*
 * This is a JavaScript function named 'Main'
 * It processes some input data based on a series of queries.
 * The core logic involves manipulating a string array 's'
 * and conditionally reversing it based on a 'reverse_flag'.
 */
function   Main   (   input   )
{
    // Enforce strict mode for better error handling and cleaner code.
    "use strict"
    
    // Split the entire input string by newline characters into an array of strings.
    const   temp   =   input.split ( "\n" )   ;

    // The first line of the input (after splitting by newline) is processed.
    // It's then split further (by default, by whitespace) to initialize 's'.
    const   s   =   temp.shift ( ) .split ( )   ;

    // The next line of the input is parsed as an integer to get 'q'.
    // 'q' likely represents the number of queries, though not directly used as a loop bound.
    const   q   =   parseInt ( temp.shift ( ) )   ;

    // Map the remaining lines of 'temp' into an array of query arrays.
    // Each query line is split by spaces.
    const   queries   =   temp.map (   query   =>   query.split ( " " )   )   ;
    
    // Initialize a flag to track whether the string array 's' should be reversed.
    // 0 means no reverse, 1 means reverse.
    let   reverse_flag   =   0   ;

    // Iterate over each query in the 'queries' array.
    queries.forEach (   query   =>
    {
        // Check if the current query has only one element.
        // This typically indicates a 'toggle reverse' operation.
        if   (   query.length   ==   1   )
        {
            // Toggle the reverse_flag: 0 becomes 1, 1 becomes 0.
            reverse_flag   =   (   reverse_flag   +   1   )   %   2   ;
        }
        else
        {
            // This is a query to add an element to 's'.
            // The position (front/back) depends on 'reverse_flag' and query[1].
            if   (   (   reverse_flag   +   parseInt ( query [ 1 ] )   %   2   )   ==   0   )
            {
                // If the condition is true, push the element to the end of 's'.
                s.push ( query [ 2 ] )   ;
            }
            else
            {
                // Otherwise, unshift the element to the beginning of 's'.
                s.unshift ( query [ 2 ] )   ;
            }
        }
    }   )   ;
    
    // After processing all queries, check the final state of 'reverse_flag'.
    if   (   reverse_flag   )
    {
        // If reverse_flag is 1, reverse 's' and then join its elements into a single string.
        console.log (   s.reverse ( ) .join ( "" )   )   ;
    }
    else
    {
        // If reverse_flag is 0, join the elements of 's' directly into a single string.
        console.log (   s.join ( "" )   )   ;
    }
}
// This section handles standard input/output and should not be modified.
// It reads the entire content from /dev/stdin and passes it to the Main function.
Main (   require ( "fs" ) .readFileSync ( "/dev/stdin" ,   "utf8" )   )   ;