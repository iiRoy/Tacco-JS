/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered significantly.
 */
const    main =    input    =>
{
    // The main function receives the raw input string.

    const inputs =    input.trim() .split ( '\n' ) ; // Split input into lines after trimming.


    const N=parseInt ( inputs[0] ) ; // Parse the first line as an integer for N.


    const sequence = inputs[1].split ( ' ' ) .map( x=>parseInt(x) ) ; // Parse the second line into an array of integers.

    /*
     * Create a sorted copy of the sequence to compare against.
     * slice() creates a shallow copy, then sort() modifies it.
     */
    const sortedSample = sequence.slice ( ) .sort ( (a,b) => a-b ) ;


    let diff = 0 ; // Initialize a counter for differences.

    // Loop through the original sequence and the sorted sample.
    for ( let i = 0 ; i < N ; i++ )
    {
        // Debugging line (originally commented out, keeping it commented).
        // console.log ( sequence[i] , sortedSample[i] ) ;

        // If an element in the original sequence doesn't match its sorted counterpart, increment diff.
        if ( sequence[i] !== sortedSample[i] )
        {
            diff ++ ;
        }
    }

    // Check if the number of differences is 0 or 2.
    // This logic determines if the sequence can be sorted by swapping two elements or is already sorted.
    diff === 2 || diff === 0
      ? console.log ( 'YES' ) // Output YES if true.
      : console.log ( 'NO' )  // Output NO if false.

}


// Invoke the main function with input read from standard input.
// This part handles reading from /dev/stdin which is common in competitive programming.
main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Call main with file system read.
// End of file.