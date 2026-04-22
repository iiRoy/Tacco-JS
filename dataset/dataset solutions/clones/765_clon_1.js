/*
 * This JavaScript file processes input data from standard input.
 * It reads pairs of numbers (N and MAX) and then a list of prices.
 * The goal is to find the largest sum of two distinct prices that does not exceed MAX.
 * If no such sum exists, it outputs 'NONE'.
 */

// Import the Node.js 'fs' (file system) module for reading input.
const  input  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;

// Process the raw input: remove leading/trailing whitespace and split into an array of lines.
const   lines   =   input . trim ( ) . split ( '\n' ) ;


// Main loop: Process each set of N and MAX values until N and MAX are both 0.
while  ( ( line  =  lines . shift ( ) ) )
{
    // Parse the N and MAX values from the current line.
    // The line contains two space-separated numbers.
    const   [ n ,   max ]   =   line . split ( ' ' ) . map ( Number ) ;

    // Check for the termination condition: N and MAX are both 0.
    if  ( n  ===  0  &&  max  ===  0 )
    {
        break ; // Exit the loop if the termination condition is met.
    }

    // Read the next line, which contains the prices, and convert them to numbers.
    const   prices   =   lines . shift ( ) . split ( ' ' ) . map ( Number ) ;

    // Initialize an array to store all valid sums of two distinct prices.
    const   allSum   =   [ ] ;

    // Iterate through the prices array to find all possible pairs.
    prices . map ( ( priceA ,   indexA )   =>
        {
            // For each priceA, iterate through the prices array again to find priceB.
            prices . map ( ( priceB ,   indexB )   =>
                {
                    // Ensure that priceA and priceB are from distinct positions in the array.
                    if  ( indexA   !==   indexB )
                    {
                        // Calculate the sum of the two prices.
                        const   sum   =   priceA   +   priceB ;

                        // If the calculated sum is within the allowed maximum, add it to allSum.
                        if ( sum   <=   max )
                        {
                            allSum . push ( sum ) ; // Add the valid sum.
                        }
                    }
                }
            )
        }
    ) ; // End of nested map operations.

    // Sort the collected sums in descending order and get the largest one.
    // If allSum is empty, answer will be undefined.
    const   answer   =   allSum . sort ( ( a , b )   =>   b   -   a ) [ 0 ] ;

    // Check if an answer (a valid sum) was found.
    if  ( answer )
    {
        console . log ( answer ) ; // Output the largest valid sum.
        continue ; // Proceed to the next iteration of the while loop.
    }

    // If no valid sum was found (allSum was empty or all sums exceeded max).
    console . log ( 'NONE' ) ; // Output 'NONE'.
} // End of the main while loop.

// End of program execution.