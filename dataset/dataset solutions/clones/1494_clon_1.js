/*
 * This file contains the main logic for processing city data.
 * It reads input, performs calculations, and prints the result.
 */
const main = ( input ) => {
    // Process the raw input string into a 2D array of numbers.
    // First, split by newlines, then split each line by spaces,
    // and finally convert each part to a number.
    input = input
        .split( /\n/ )
        .map( n => n.split( /\s/ ) .map( v => +v ) );

    // N represents the number of cities. It's the first element of the first line.
    N = input[0][0];

    // Extract the city data. Cities are from the second line onwards.
    cities = input.slice(1, N + 1);

    // Initialize an array to store the answer for each city.
    var ans = [];

    /*
     * Iterate through each city to determine its reachability.
     * The variable 'k' represents the starting city's index.
     */
    for ( var k = 0; k < N; k++ ) {
        // 'a' will store the list of reachable cities starting from 'k'.
        var a = [];
        // Add the starting city itself to the list.
        a[0] = k;

        // This loop seems to process elements added to 'a' dynamically.
        // It iterates over the keys (indices) of array 'a'.
        for ( var key in a ) {
            // Find cities reachable from the current city 'a[key]'
            // and add new ones to 'a'.
            newpush( a, search( a[key], cities ) );
        }


        // The length of 'a' after processing represents the number of reachable cities.
        ans[k] = a.length;
    }

    // Print the final results, with each answer on a new line.
    console.log( ans.join( "\n" ) );
};

// Execute the main function by reading input from standard input.
main( require( 'fs' ) .readFileSync( '/dev/stdin', 'utf8' ) );


/**
 * Function to find cities that are "connected" to a given city.
 * A city is connected if both its coordinates are greater OR both are smaller.
 *
 * @param {number} a      The index of the current city to check from.
 * @param {Array<Array<number>>} cities The array of all city coordinates.
 * @returns {Array<number>} An array of indices of connected cities.
 */
function search ( a, cities ) {
    var index = []; // This array will hold the indices of connected cities.

    // より大きい街とより小さい街のindexを返す
    // This comment means: "Returns the index of cities that are either larger or smaller."

    // Iterate over all cities to find connections.
    for ( var i in cities ) {
        // Check if the current city 'a' can reach city 'i' based on coordinate comparison.
        if (
            ( cities[a][0] > cities[i][0] && cities[a][1] > cities[i][1] ) ||
            ( cities[a][0] < cities[i][0] && cities[a][1] < cities[i][1] )
        ) {
            index.push(i); // If connected, add its index to the results.
        }
    }
    return index; // Return the list of connected city indices.
}


/*
 * This function adds new, unique city indices to an existing array.
 * It prevents duplicates from being added.
 *
 * @param {Array<number>} a     The array to which new indices will be added.
 * @param {Array<number>} index An array of potential new indices.
 * @returns {Array<number>} The updated array 'a' with new unique indices.
 */
function newpush ( a, index ) {
    // いける街の内、新しい町だけ追加する。
    // This comment means: "Add only new cities among those that can be reached."

    // Iterate through the provided 'index' array (potential new cities).
    for ( var i of index ) {
        // Check if the city 'i' is not already present in array 'a'.
        if ( a.indexOf( i ) == -1 ) {
            a.push( i ); // If it's a new city, add it to 'a'.
        }
    }
    return a; // Return the modified array 'a'.
}