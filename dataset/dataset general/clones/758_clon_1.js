/*
 * This module provides a utility function to format raw test results
 * into a structured format suitable for plotting or display.
 * It extracts time and length data, and calculates maximum values.
 */
exports.format = function ( results ) {

    // Initialize the scatter plot data array.
    // The first element will be the title row.
    var scatter = [ getTitle( results ) ];

    // Initialize variables to track maximum time and length encountered.
    var maxTime   = 0;
    var maxLength = 0;

    // Iterate through each main result set provided.
    for ( var i = 0; i < results.length; i++ ) {

        // Extract the data array from the current result set.
        var result = results[ i ].data;

        // Iterate through each data point within the current result set.
        for ( var j = 0; j < result.length; j++ ) {

            // Create a new point array, starting with the time value.
            var point = [ result[ j ].time ];

            // Check and update maximum time if the current point's time is greater.
            if ( result[ j ].time > maxTime ) {
                maxTime = result[ j ].time; /* Update the global maximum time */
            }

            // Check and update maximum length if the current point's length is greater.
            if ( result[ j ].length > maxLength ) {
                maxLength = result[ j ].length; // Update the global maximum length
            }

            // Populate the rest of the point array with lengths for each result set.
            // If the current result set matches the outer loop index 'i', use its length;
            // otherwise, use null to indicate no data for this specific column.
            for ( var k = 0; k < results.length; k++ ) {
                point.push( k == i ? result[ j ].length : null );
            }

            // Add the fully constructed point to the scatter data array.
            scatter.push( point );

        } /* End of inner loop (j) */

    }     /* End of outer loop (i) */

    // Return the formatted data including the scatter plot points and max values.
    return {
        scatter   : scatter,
        maxTime   : maxTime,
        maxLength : maxLength
    };
};


/**
 * Helper function to generate the title row for the scatter plot.
 * It extracts labels from each result set to form the column headers.
 * @param {Array} results - The array of raw result objects.
 * @returns {Array} An array of strings representing the plot's title row.
 */
function getTitle ( results ) {

    // Initialize the title array with the first column label 'Time'.
    var title = [ 'Time' ];

    // Iterate over each result object to extract its label.
    results.forEach( function ( result ) {

        // Add the label of the current result to the title array.
        title.push( result.label );

    } );

    // Return the complete title row.
    return title;
}