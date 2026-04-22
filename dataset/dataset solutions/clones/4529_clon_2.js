"use strict"; // Enable strict mode for cleaner code execution

/**
 * Processes raw input data to calculate minimum and maximum possible distinct color counts.
 * This function handles parsing input, categorizing numeric values, and determining output.
 *
 * @param {string} inputString - The raw string input, typically from a file or command line.
 */
const processInputData = ( inputString ) => {

    // Split the input string into an array of lines
    inputString = inputString.split( "\n" );

    // Parse the first line for the initial quantity (though not directly used in the logic)
    const initialQuantity = parseInt( inputString[0] );

    // Parse the second line, splitting by space and converting each part to an integer
    const numericValues = inputString[1] .split( " " ) .map( ( currentVal ) => parseInt( currentVal ) );

    // Initialize a counter for values that don't fall into predefined categories
    let wildcardCount = 0;

    // Define an object to track the presence of different color categories
    const colorPresenceTracker = {
        ash:     false, // Represents values < 400
        sepia:   false, // Represents values < 800
        emerald: false, // Represents values < 1200
        aqua:    false, // Represents values < 1600
        azure:   false, // Represents values < 2000
        gold:    false, // Represents values < 2400
        flame:   false, // Represents values < 2800
        crimson: false  // Represents values < 3200
    };

    // Iterate through each value in the numericValues array
    for ( let elementIndex in numericValues ) {
        const value = numericValues[elementIndex]; // Get the current numeric value

        // Categorize the value based on predefined thresholds
        if ( value < 400 ) {
            colorPresenceTracker.ash = true;
        } else if ( value < 800 ) {
            colorPresenceTracker.sepia = true;
        } else if ( value < 1200 ) {
            colorPresenceTracker.emerald = true;
        } else if ( value < 1600 ) {
            colorPresenceTracker.aqua = true;
        } else if ( value < 2000 ) {
            colorPresenceTracker.azure = true;
        } else if ( value < 2400 ) {
            colorPresenceTracker.gold = true;
        } else if ( value < 2800 ) {
            colorPresenceTracker.flame = true;
        } else if ( value < 3200 ) {
            colorPresenceTracker.crimson = true;
        } else {
            // If the value exceeds all category thresholds, increment the wildcard counter
            wildcardCount++;
        }
    }

    // Count how many distinct color categories have been marked as present (true)
    const foundDistinctColors = Object.keys( colorPresenceTracker )
                                     .filter( colorKey => colorPresenceTracker[colorKey] === true )
                                     .length;

    // Calculate the minimum possible number of distinct colors
    // If no distinct colors were found, the minimum is 1 (due to wildcard or just no category matches).
    // Otherwise, it's simply the number of distinct colors found.
    const minimumRequired = ( foundDistinctColors === 0 ) ? 1 : foundDistinctColors;

    // Calculate the maximum possible number of distinct colors
    // This is the sum of distinct colors found and the wildcard count.
    const maximumPotential = foundDistinctColors + wildcardCount;

    // Output the calculated minimum and maximum values, separated by a space
    console.log( minimumRequired + " " + maximumPotential );
};

// Read the input from standard input and pass it to the processing function
processInputData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );