/*
 * This is a JavaScript function named Main.
 * It processes some input data.
 */
function Main(input)
{
    // The input string is first split by newline characters.
    // Then, each line is further split by space characters.
    input = input .split ( "\n" ) .map ( v => v .split ( " " ) ) ;

    /* Declare a constant 'n'
     * It holds the value from the first element of the processed input.
     */
    const n = input [0] [0] ;


    // Define an arrow function named 'roop'.
    // This function calculates a count based on current position and coordinates.
    const roop = ( curent , x , y ) =>
    {
        // Initialize a counter variable.
        // It starts from 1 because the current position is included in the count.
        let counter = 1 ;

        // Iterate through the input data from index 1 up to 'n'.
        for ( let i = 1 ; i <= n ; i ++ )
        {
            // Skip the iteration if the current index 'i' is the same as 'curent'.
            if ( curent === i )
            {
                continue ; // Move to the next iteration.
            }

            // Extract coordinates px and py from the input array at index 'i'.
            const px = input [i] [0] , py = input [i] [1] ;

            // Check a specific condition involving the coordinates.
            // If (x < px AND y < py) OR (px < x AND py < y)
            if ( ( x < px && y < py ) || ( px < x && py < y ) )
            {
                // Log the coordinates px and py to the console.
                console .log ( px , py ) ;
                // Increment the counter if the condition is met.
                counter ++ ;
            }
        }
        // Return the final calculated count.
        return counter ;
    } ;


    // Main loop: Iterate from 1 to 'n'.
    for ( let i = 1 ; i <= n ; i ++ )
    {
        // Log a separator string to the console for visual distinction.
        console .log ( "xxxxxxx" ) ;

        // Call the 'roop' function with current index 'i' and coordinates from input.
        // Log the result of the 'roop' function call.
        console .log ( roop ( i , input [i] [0] , input [i] [1] ) ) ;
    }

} /* End of Main function */

// This section handles reading input from standard input and calling the Main function.
// It's a common pattern for competitive programming in Node.js.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;