/*
 * This is a self-executing anonymous function.
 * It encapsulates the entire application logic.
 */
( function ( )
{
    // Declare a global variable within this scope to store raw input data.
    var input = '' ;


    /**
     * The primary entry point for the application logic after input is received.
     * This function orchestrates the main calculation and output.
     */
    function main ( )
    {
        // Declare local variables for the main calculation.
        var d ,
            x = 600 ; // 'x' represents a maximum limit or boundary value.

        // Parse the first line of input as a floating-point number.
        d = parseFloat( input [ 0 ] ) ;

        // Output the rounded result of the integral calculation to the console.
        console . log ( calIntegral ( d , x ) ) ;
    } // End of main function.


    /**
     * Calculates an approximate integral using a simple summation method.
     * The function iterates and sums up areas of rectangles.
     *
     * @param {number} d - The step size or delta for the integration.
     * @param {number} x - The upper bound for the integration loop (not directly used as an upper bound, but as a limit for `i * d`).
     * @returns {number} The rounded total accumulated area.
     */
    function calIntegral ( d , x )
    {
        var i ,
            area = 0 ; // Initialize the accumulated area.

        // Loop while the current point (i * d) is less than the limit (600).
        // This simulates integration from 0 up to 600 with step 'd'.
        for ( i = 1 ; i * d < 600 ; i += 1 )
        {
            // Add the area of the current rectangle: (height^2) * width
            // Height is (i * d), width is 'd'.
            area += Math . pow ( i * d , 2 ) * d ;
        }

        // Return the final accumulated area, rounded to the nearest integer.
        return Math . round ( area ) ;
    }


    // --- Standard Input Handling ---

    // Resume the stdin stream to begin listening for data.
    process . stdin . resume ( ) ;

    // Set the character encoding for the incoming data.
    process . stdin . setEncoding ( 'utf8' ) ;

    // Attach a 'data' event listener to accumulate incoming chunks.
    process . stdin . on ( 'data' , function ( chunk )
    {
        input += chunk ; // Append the current data chunk to the 'input' string.
    } ) ;

    // Attach an 'end' event listener to process the full input once it's complete.
    process . stdin . on ( 'end' , function ( )
    {
        // Split the accumulated input string by newlines to get an array of lines.
        input = input . split ( '\n' ) ;
        // Call the main application logic.
        main ( ) ;
    } ) ;

} ) ( ) ; // Invoke the anonymous function immediately.