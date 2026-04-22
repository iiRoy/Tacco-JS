/*
 * This JavaScript program processes numerical data received from standard input.
 * It is designed to calculate the standard deviation for multiple sets of numbers.
 *
 * Each set of input data consists of:
 * 1. An integer 'n' on its own line, indicating the count of numbers in the set.
 * 2. A line containing 'n' space-separated numbers.
 * The program continues to read and process sets until 'n' is encountered as 0 or a non-numeric value.
 *
 * The calculated standard deviation for each set is then printed to the console,
 * formatted to exactly 8 decimal places.
 */
process . stdin . on ( "data" ,  function ( c ) {

    // Convert the incoming data buffer 'c' to a string, remove leading/trailing whitespace,
    // and then split it into an array 'a' of strings, where each element represents a line of input.
    // Initialize an index 'i' to 0 for iterating through the 'a' array.
    var a = ( c + "" ) . trim ( ) . split ( "\n" ) , i = 0 ;

    // This loop processes each set of numbers. It continues as long as
    // the element at index 'i' in array 'a' can be successfully converted
    // to a positive number (which represents 'n', the count of numbers in the current set).
    while ( + a [ i ] ) {

        // Extract 'n' (the count of numbers for the current set) by converting a[i] to a number.
        // Initialize 'm' (which will hold the sum and later the mean) to 0.
        // Initialize 'x' (which will hold the sum of squared differences from the mean) to 0.
        // Extract the line containing the actual numbers (a[i+1]), split it by spaces,
        // and store the resulting array of string numbers in 's'.
        var n = + a [ i ] , m = 0 , x = 0 , s = a [ i + 1 ] . split ( " " ) ;

        // Iterate over each string 'b' in the array 's'.
        // Convert 'b' to a number and add it to 'm' to calculate the sum of all numbers.
        s . forEach ( function ( b ) {
            m += + b ;
        } ) ;

        // Calculate the mean by dividing the total sum 'm' by the count 'n'.
        m /= n ;


        // Iterate over each string 'b' in the array 's' again.
        // For each number, calculate the difference from the mean ('+b - m'),
        // square this difference using Math.pow(), and add it to 'x'.
        // 'x' will accumulate the sum of squared differences.
        s . forEach ( function ( b ) {
            x += Math . pow ( + b - m , 2 ) ;
        } ) ;

        // Calculate the standard deviation:
        // 1. Divide the sum of squared differences 'x' by the count 'n'.
        // 2. Take the square root of the result using Math.sqrt().
        // Finally, format the standard deviation to 8 decimal places using toFixed(8)
        // and print it to the console.
        console . log ( Math . sqrt ( x / n ) . toFixed ( 8 ) ) ;

        // Increment the index 'i' by 2 to move to the beginning of the next test case.
        // This skips both the 'n' line and the data line of the current set.
        i += 2 ;

    } // End of the while loop for processing test cases.

} ) . resume ( ) ; // Activates the standard input stream to begin listening for 'data' events.