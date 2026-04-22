/*
 * This is an empty comparison function.
 * It currently does nothing.
 */
const compare = ( a , b ) => {

}; /* End of compare function */


// Function to convert an array into a dictionary
// where keys are array elements and values are their counts.
function toCountDict ( array ) {
    // Initialize an empty dictionary to store counts.
    var dict = {};

    // Iterate over each key (element) in the input array.
    for ( var key of array ) {
        /*
         * For each key, filter the original array to find
         * all occurrences of that key, and then count them.
         * Assign this count to the dictionary.
         */
        dict[ key ] = array . filter ( function ( x ) {
            return x == key
        } ) . length;
    }

    // Return the populated dictionary.
    return dict;
}


/*
 * Main function to process the input.
 * It reads from stdin, counts occurrences,
 * finds the maximum count, and prints elements
 * with the maximum count in sorted order.
 */
const main = ( input ) => {
    // Split the input string by newlines to get an array of arguments.
    const args = input . split ( '\n' );

    // The first argument is 'n', which is currently unused.
    const n = args . shift ( );

    // Convert the remaining arguments into a count dictionary.
    const dict = toCountDict ( args );

    // Get all unique keys (elements) from the dictionary.
    const keys = Object . keys ( dict );

    // Initialize an empty array to store objects with key-value pairs.
    const obj = [];

    // Initialize 'max' to negative infinity to find the true maximum count.
    var max = -Infinity;

    // Iterate over each key to populate 'obj' and find the maximum count.
    keys . forEach ( key => {
        // Create a temporary object for the current key.
        const tmp = {};

        // Assign the key.
        tmp . key = key;

        // Assign the value (count) from the dictionary.
        tmp . value = dict[ key ];

        // Add the temporary object to the 'obj' array.
        obj . push ( tmp );

        // If the current key's count is greater than the current max, update max.
        if ( dict[ key ] > max ) {
            max = dict[ key ]
        }
    } );

    // Initialize an empty array to store the results (elements with max count).
    const res = [];

    // Iterate over the 'obj' array.
    obj . forEach ( el => {
        // If an element's value (count) matches the maximum count,
        // add its key to the results array.
        if ( el . value == max ) {
            res . push ( el . key )
        }
    } );

    // Sort the results alphabetically.
    res . sort ( );

    // Print each element in the results array.
    res . forEach ( el => {
        console . log ( el )
    } );

}; // End of main function


// Execute the main function by reading input from standard input.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) );