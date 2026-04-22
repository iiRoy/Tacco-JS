function   main  ( arg )      {
    // This is the main function that processes the input argument.

    arg = arg.trim().split ( "\n" ) ;     // First, clean up the input string by trimming and splitting into lines.

    /*
     * Remove the first line of the input.
     * This line might contain metadata like the number of subsequent lines, which is not directly used here.
     */
    arg.shift ( ) ;


    var   s    =   arg.shift ( ) ;        // Extract the target string 's' from the processed input.


    // Process the remaining lines: split each line by space, convert parts to numbers, then decrement each number.
    arg = arg.map ( e => e.split ( " " ) .map ( Number ) .map ( e => e - 1 ) ) ;


    var   result   =   new   Array ( arg.length ) .fill ( 0 ) ;   // Initialize a result array with zeros, its length based on the number of queries.

    var   count   =   0 ;         // Initialize a counter for 'AC' occurrences.

    /*
     * Declare an array to hold indices.
     * In this specific implementation, 'indexs' is populated but not subsequently used.
     */
    var   indexs   =   new   Array ( arg.length ) ;


    for  ( var  i  =  0 ;  i  <  arg.length ;  i++ )   {
        // Populate the 'indexs' array with sequential integers.
        indexs [ i ]   =   i ;
    }


    /*
     * Iterate through the string 's' to find all occurrences of the "AC" substring.
     * The loop goes up to s.length - 1 to ensure s[i+1] is always valid.
     */
    for  ( var  i  =  0 ;  i  <  s.length   -   1 ;  i++ )   {

        // Check if the current character is 'A' and the next character is 'C'.
        if  ( s [ i ]  ==  'A'   &&   s [ i   +   1 ]  ==  'C' )   {
            count++ ;   // If "AC" is found, increment the counter.
        }

        // Store the cumulative count of "AC" pairs up to the current position (i+1) in the 'result' array.
        result [ i   +   1 ]   =   count ;
    }


    // Now, process each query from the 'arg' array.
    for  ( var  i  =  0 ;  i  <  arg.length ;  i++ )   {

        let   l   =   arg [ i ] [ 0 ] ;   // Extract the left boundary (start index) of the current query.

        let   r   =   arg [ i ] [ 1 ] ;   // Extract the right boundary (end index) of the current query.

        // Calculate the number of "AC" pairs within the range [l, r] using the precomputed 'result' array.
        // This is done by subtracting the cumulative count at 'l' from the cumulative count at 'r'.
        console.log ( result [ r ]   -   result [ l ] ) ;
    }

}


// Call the main function with input read from standard input.
// The input is read using Node.js's 'fs' module, synchronously, and decoded as UTF-8.
main ( require ( 'fs' ) .readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;