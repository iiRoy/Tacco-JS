let numericMeasurements = [ 40, 100, 1, 5, 25, 10 ]; // Initialize an array with various numerical entries.

/*
 * Apply a custom sorting function to arrange the elements.
 * This specific comparison ensures a descending order.
 */
numericMeasurements.sort( function ( valueB, valueA ) { return valueB - valueA; } ); // Sort in reverse numerical order.

// Display the final, sorted collection in the console output.
console.log( numericMeasurements );