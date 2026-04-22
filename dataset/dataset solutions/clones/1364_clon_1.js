/*
 * This script processes incoming data from standard input.
 * It expects a line of space-separated numbers, sorts them numerically,
 * and then prints the sorted numbers back to standard output.
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 */

// Establish an event listener for incoming data on the standard input stream.
process
    . stdin
    . on (
        'data' , // The event name to listen for.
        ( line ) => { // Callback function executed when 'data' event occurs.
            // Convert the incoming Buffer 'line' to a string.
            // Then split the string into an array of substrings using space as a delimiter.
            // Example: "5 2 8" becomes ["5", "2", "8"]
            let   inputNumbersArray = line . toString ( ) . split ( ' ' ) ;

            // Sort the array of numbers numerically in ascending order.
            // The comparison function (a, b) => a - b ensures numerical sorting,
            // as standard sort() would sort lexicographically.
            let sortedNumbersArray = inputNumbersArray . sort ( ( a , b ) => a - b ) ;

            // Join the sorted numbers back into a single string,
            // with each number separated by a space.
            let outputString = sortedNumbersArray . join ( ' ' ) ;

            // Print the resulting sorted string to the standard output.
            console . log ( outputString ) ;
        }
    ) ; // End of the 'on' method call.