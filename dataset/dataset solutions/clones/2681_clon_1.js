/*
 * This is a JavaScript function designed to process an array of numbers
 * and determine if a specific condition is met across its elements.
 * The input is expected to be a string containing lines of data.
 */
function   main ( input )
{
    // Split the input string by newline characters to get individual arguments.
    const   args   =   input . split ( '\n' ) ;

    // The first argument `N` is expected to be a number representing the count of elements.
    const N = args[ 0 ] ;

    // The second argument `H` is a space-separated string of numbers, which will be parsed later.
    const H = args[ 1 ] . split ( ' ' ) ;

    /*
     * Initialize a flag variable to 'Yes'. This will be updated based on the processing logic.
     * It indicates whether the condition holds true throughout the array.
     */
    var flag = 'Yes' ;

    // This variable `jadge` appears to be unused in the provided logic.
    var jadge = false ;

    // Initialize an empty array to store the parsed integer values from `H`.
    var array = [ ] ;

    /*
     * Loop through the `H` array elements, parsing each into an integer
     * and pushing it into the `array`.
     * The loop runs `N` times, where `N` is the count of elements.
     */
    for ( var k = 0 ; k < N ; k ++ )
    {
        array . push ( parseInt ( H [ k ] , 10 ) ) ;
    }

    // Check the first element of the `array`.
    // If it's greater than 0, decrement it by 1.
    if ( array [ 0 ] > 0 )
    {
        array [ 0 ] = array [ 0 ] - 1 ;
    }

    // Main processing loop: Iterate from the second element (index 1) up to `N-1`.
    for ( var i = 1 ; i < N ; i ++ )
    {

        // Compare the current element `array[i]` with the previous element `array[i-1]`.
        if ( array [ i - 1 ] < array [ i ] )
        {
            // If the previous element is strictly less than the current one,
            // set flag to 'Yes' and decrement the current element.
            flag = 'Yes' ;
            array [ i ] = array [ i ] - 1 ;
        }
        else if ( array [ i - 1 ] === array [ i ] )
        {
            // If the previous element is equal to the current one,
            // set flag to 'Yes'. No decrement needed.
            flag = 'Yes' ;
        }
        else
        {
            // If the previous element is greater than the current one,
            // further check the difference.
            if ( array [ i - 1 ] - array [ i ] === 1 )
            {
                // If the difference is exactly 1, set flag to 'Yes'.
                flag = 'Yes' ;
            }
            else
            {
                // Otherwise (difference is greater than 1), set flag to 'No'.
                flag = 'No' ;
            }
        }

        // If at any point the flag becomes 'No', break out of the loop early.
        if ( flag === 'No' ) break ;
    }

    // This block iterates through the modified `array` and logs each element.
    // Note: The problem statement or context might imply this output is for debugging
    // or intermediate results, as the final output is just the `flag`.
    array . map ( ( res ) =>
    {
        console . log ( res ) ;
    } ) ;


    // Finally, print the determined `flag` value to the console.
    console . log ( flag ) ;
}

// Read input from standard input and pass it to the `main` function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;