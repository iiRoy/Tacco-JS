/* This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 *
 * The modifications are strictly limited to whitespace (indentation, spacing,
 * blank lines) and comments (addition, removal, modification).
 *
 * The goal is to make the code visually distinct while maintaining
 * exact functional equivalence.
 */


( function main() {
    // Acquire the 'fs' module to read files.
    // Read the input from standard input, decode as UTF-8,
    // remove leading/trailing whitespace, and split into an array of characters.
    let  line = require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' ) . trim() . split( '' );

    // Initialize a list to store height values.
    // The initial height is set to zero.
    let   height_list = [ 0 ];
    let current_height = 0; // Represents the current vertical position.


    // Remove any leading flat sections or upward slopes until a downward slope is encountered.
    while ( line[ 0 ] !== '\\' )
    {
        line . shift();
    }


    // Remove any trailing flat sections or upward slopes until an upward slope is encountered.
    while ( line[ line.length - 1 ] !== '/' )
    {
        line . pop();
    }


    // Iterate through each character of the processed input line
    // to calculate the height profile.
    line.forEach(
        function( e, i )
        {
            if ( e === '\\' ) // If the character is a downward slope, decrease height.
            {
                current_height -= 1
            }
            else if ( e === '_' ) // If the character is a flat section, height remains unchanged.
            {
                current_height += 0 // Explicitly adding zero for clarity, no change in height.
            }
            else // If the character is an upward slope, increase height.
            {
                current_height += 1
            }

            // Add the calculated current height to the height_list.
            height_list.push( current_height );
        }
    );


    let sum = 0;      // Total accumulated water volume.
    let holes = [];   // List to store the volume of individual holes.

    // Process the height list to find and calculate water volumes in holes.
    // Continue as long as there are at least two elements in the list.
    for ( ; height_list.length > 1; )
    {
        // Attempt to find and calculate the volume of a hole starting from the current 'begin' point.
        let h = makeHole( height_list );

        if ( h > 0 ) // If a valid hole with positive volume is found.
        {
            sum += h;         // Add to the total sum.
            holes.push( h );  // Record the volume of this hole.
        }
    }


    // Output the total sum of water.
    console.log( sum );

    // Output the number of holes and their individual volumes, if any holes were found.
    // If holes.length is 0, the expression evaluates to false, and only an empty string (or similar) is printed.
    // Otherwise, it prints the count followed by the space-separated volumes.
    console.log( holes.length && holes.length + ' ' + holes.join( ' ' ) );

} ) (); // Immediately Invoked Function Expression (IIFE) ends here.


/*
 * Function: makeHole
 * Description: Attempts to identify and calculate the volume of a "hole"
 *              (a depression that can hold water) from a given list of heights.
 * Parameters:
 *   list - An array of numerical height values.
 * Returns:
 *   The calculated volume of the hole (an integer >= 0).
 *   Returns 0 if no hole can be formed or if the depression is not enclosed.
 */
function makeHole( list ) {

    // Remove the first element from the list and use it as the 'begin' height.
    begin = list.shift();

    // Check if the 'begin' height is less than or equal to the maximum height
    // of the remaining elements in the list. This condition determines
    // if a potential hole exists (i.e., if there's a wall to the right).
    if ( begin <= list.reduce( ( a, b ) => Math.max( a, b ), -100000 ) )
    {
        let area = 0; // Initialize the area (volume) of the hole.

        // Loop to calculate the area of the hole until a condition is met.
        while ( true )
        {
            // Break conditions:
            // 1. If the list is empty (no more heights to process).
            // 2. If the 'begin' height is less than or equal to the current height (indicating the end of the hole).
            if ( list.length == 0 || begin <= list[ 0 ] )
            {
                break;
            }

            // Calculate the water held at the current position: 'begin' height minus the current list height.
            // Then, remove the current height from the list.
            area += begin - list.shift();
        }
        return area; // Return the calculated area of the hole.
    }
    else
    {
        return 0; // If no hole can be formed, return 0.
    }
}