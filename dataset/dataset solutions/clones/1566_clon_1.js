/*
 * This is a JavaScript program designed to process input from stdin.
 * It reads numerical data, performs calculations based on specific conditions,
 * and outputs results to the console.
 *
 * The program uses an asynchronous immediately-invoked function expression (IIFE)
 * to handle asynchronous input reading from process.stdin.
 */
( async () => { /* Start of the main asynchronous execution block */

    // Initialize an empty string to accumulate all standard input chunks.
    let input = '';

    // Asynchronously iterate over chunks from standard input.
    // Each chunk received is appended to the 'input' string.
    for await ( const chunk    of    process.stdin )
    {
        input += chunk; // Concatenate the current chunk to the input string.
    }


    // Split the accumulated input string into an array of lines,
    // using the newline character as a delimiter.
    let lines = input.split( /\n/ );


    /*
     * Parse the first line of input to extract dimensions 'h' (height) and 'w' (width).
     *
     * 1. lines.shift() removes and returns the first element (the header line).
     * 2. .split(/\s/) splits this header line by whitespace to get individual string values.
     * 3. .map(v => +v) converts each string value to a number. The unary plus operator `+v` is used for this.
     * 4. Destructuring assignment `const [h, w] = ...` assigns the first two numbers to 'h' and 'w' respectively.
     */
    const [ h , w ] = lines . shift ( ) . split ( /\s/ ) . map ( v => +v ) ;


    // Slice the 'lines' array to retain only 'h' number of data lines,
    // effectively discarding any extra lines that might follow the main data.
    lines = lines . slice ( 0 , h ) ;


    /*
     * Process each remaining line of data.
     *
     * 1. .map(line => ...) iterates over each line.
     * 2. line.split(/\s/) splits the current line by whitespace into an array of string numbers.
     * 3. .map(v => v - 1) converts each string number to a number and then decrements it by 1.
     *    This likely adjusts for 0-based indexing from 1-based input.
     * The result is an array of arrays, where each inner array contains two 0-indexed numbers [a, b].
     */
    lines = lines . map ( line => line . split ( /\s/ ) . map ( v => v - 1 ) ) ;


    // Output the parsed dimensions and the processed data lines to the console
    // for debugging or verification purposes.
    console . log ( h , w , lines ) ;


    // Initialize an array 'count' of size 'w' (width) with all elements set to 0.
    // This array will store cumulative counts or states for each column.
    let count = new Array ( w ) . fill ( 0 ) ;


    /*
     * Outer loop: Iterates 'h' times, corresponding to each row of input data.
     * The variable 'i' represents the current row index.
     */
    for ( let i = 0 ; i < h ; i ++ )
    {
        // Initialize 'left' to a large number (1e6, which is 1,000,000).
        // This variable likely tracks a minimum value or a state across columns for the current row.
        let left = 1e6 ;


        /*
         * Inner loop: Iterates 'w' times, corresponding to each column.
         * The variable 'j' represents the current column index.
         */
        for ( let j = 0 ; j < w ; j ++ )
        {
            // Conditional check: If the current column's count is very high (>= 5e5)
            // AND the 'left' tracker is also very high (>= 5e5),
            // then skip the rest of the inner loop's logic for this column
            // and move to the next column.
            if ( ( count [ j ] > 5e5 ) && ( left > 5e5 ) )
            {
                continue ; // Skip to the next iteration of the inner loop.
            }


            // Destructure the current row's data [a, b] from the 'lines' array.
            // 'a' and 'b' represent a range or interval for the current row.
            const [ a , b ] = lines [ i ] ;


            /*
             * Conditional logic based on column index 'j' relative to the range [a, b].
             */
            if ( ( j < a ) || ( j > b ) ) // If the current column 'j' is outside the range [a, b]
            {
                count [ j ] ++ ; // Increment the count for this column.

                // Update 'left' to be the minimum of its current value and the newly incremented count[j].
                left = Math . min ( left , count [ j ] ) ;
            }
            else if ( left > 5e5 ) // If 'j' is within [a, b], AND 'left' is very high (>= 5e5)
            {
                // Set the count for this column to a very high value (1e6).
                count [ j ] = 1e6 ;
            }
            else // If 'j' is within [a, b], AND 'left' is NOT very high (< 5e5)
            {
                left ++ ; // Increment the 'left' tracker.

                // Set the count for this column to the new value of 'left'.
                count [ j ] = left ;
            }
        } // End of inner loop (for columns)


        // After processing all columns for the current row, log the updated 'count' array.
        console . log ( count ) ;


        /*
         * Final check for the current row:
         * Determine if any column in 'count' has a value less than 5e5.
         */
        if ( count . find ( a => a < 5e5 ) ) // If at least one column has a count less than 5e5
        {
            // Find the minimum value in the 'count' array that is less than 5e5
            // and output it. The initial minimum value for reduction is set to 5e5.
            console . log ( count . reduce ( ( prev , current ) => Math . min ( prev , current ) , 5e5 ) ) ;
        }
        else // If all columns in 'count' have values greater than or equal to 5e5
        {
            // Output -1, indicating no column met the condition (all were >= 5e5).
            console . log ( -1 ) ;
        }
    } // End of outer loop (for rows)

} ) ( ) ; // End of the main asynchronous IIFE.