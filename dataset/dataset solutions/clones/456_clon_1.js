/* This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical identity.
 * Only whitespace and comments have been altered significantly.
 */

function   main (  )
{
    // Declare all necessary variables for the main processing logic.
    var
        i   =  0,     // Counter for input array index
        j,             // Loop counter for monthly data
        flag,          // Boolean flag to track if 'L' becomes non-positive
        L,             // Main value to track (e.g., remaining capacity/resource)
        MN;            // Array to store parsed monthly numbers (e.g., [consumed, produced])

    // Main processing loop: continues until a specific break condition is met.
    for  (   ;    ;   )
    {
        // Read the initial 'L' value for the current test case.
        // The 'input' array is processed sequentially using 'i'.
        L  =  Number ( input [ i++ ] ) ;

        // If 'L' is 0, it signifies the end of input, so break the loop.
        if (   L   ===   0    )
        {
            break; // Exit the infinite loop.
        }

        // Initialize the flag for the current 'L' test case.
        // 'true' means 'L' has not yet become non-positive.
        flag   =   true;


        // Loop through 12 months of data for the current 'L'.
        for  (  j  =  0;   j  <  12;   j++  )
        {
            // Parse the monthly data: split the string by space and convert to numbers.
            // 'MN[0]' is the first number, 'MN[1]' is the second.
            MN   =   input [ i++ ] . split ( ' ' ) . map ( Number ) ;

            // Update 'L' based on the monthly consumption and production.
            // L = L - (MN[0] - MN[1])
            L   -=   MN [ 0 ]   -   MN [ 1 ];

            // Check if 'L' has become non-positive for the first time in this sequence.
            // The 'flag' ensures this message is printed only once.
            if   (   flag   &&   L   <=   0    )
            {
                // Output the month number (1-indexed).
                console.log (   j   +   1   ) ;

                // Set flag to false to prevent further output for this 'L' sequence.
                flag   =   false;
            }
        } // End of inner loop for months.

        // After processing all 12 months, if 'L' never went non-positive,
        // or if the flag remained true (meaning L was always positive), print 'NA'.
        if   (   flag    )
        {
            console.log (   'NA'   ) ;
        }
    } // End of main processing loop.
} // End of 'main' function definition.


// Global variable to store all incoming standard input data.
var
    input   =   ''; // Initialize as an empty string.


// Set up standard input handling.

// Resume the standard input stream.
process . stdin . resume ( ) ;

// Set the encoding for incoming data to UTF-8.
process . stdin . setEncoding (   'utf8'   ) ;

// Event listener for 'data' chunks from stdin.
process . stdin . on (   'data',   function (   chunk   )
{
    // Append the received chunk to the 'input' string.
    input   +=   chunk;
}   ) ;

// Event listener for the 'end' of the stdin stream.
process . stdin . on (   'end',   function (  )
{
    // Once all input is received, split the accumulated string by newlines.
    // This creates an array where each element is a line from the input.
    input   =   input . split (   '\n'   ) ;

    // Call the main function to start processing the input.
    main ( ) ;
}   ) ;