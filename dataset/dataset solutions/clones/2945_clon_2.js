// This function processes all incoming raw data
function ProcessInput( rawData ) {
    // The raw data string is split into an array of individual lines
    parsedLines = rawData.split( '\n' );

    // Determine the total number of operations or queries to execute
    var numQueries = parseInt( parsedLines[0], 10 );

    // Initialize accumulators for two distinct sets of values
    var totalX = 0;
    var totalY = 0;
    // Create a dynamic collection to store primary data points
    var dataPoints = new Array();

    // Iterate through each operation specified by the input
    for ( var queryIndex = 1; queryIndex <= numQueries; queryIndex++ ) {

        // Parse the current line to extract the operation type and its associated numeric values
        currentOperation = parsedLines[queryIndex].split( ' ' );

        // Check if the current operation is an insertion (type 1)
        if ( currentOperation[0] == 1 ) {
            // Extract and convert the first value to an integer
            var valX = parseInt( currentOperation[1], 10 );
            // Extract and convert the second value to an integer
            var valY = parseInt( currentOperation[2], 10 );

            // Accumulate the extracted values
            totalX += valX;
            totalY += valY;
            // Add the primary value to the collection of data points
            dataPoints.push( valX );
        }
        // Otherwise, it's a query operation (type 2)
        else {
            // Calculate the arithmetic mean of all stored data points
            var averageX = totalX / dataPoints.length;
            // Initialize the minimum squared difference with the first data point
            var minSquaredDiff = ( dataPoints[0] - averageX ) * ( dataPoints[0] - averageX );
            // Initialize the value closest to the average with the first data point
            var closestValX = dataPoints[0];

            // Loop through the data points to find the one closest to the average
            for ( var dataIndex = 0; dataIndex < dataPoints.length; dataIndex++ ) {
                // Compute the squared difference for the current data point
                var currentSquaredDiff = ( dataPoints[dataIndex] - averageX ) * ( dataPoints[dataIndex] - averageX );

                // If a smaller squared difference is found, update the minimum and the closest value
                if ( currentSquaredDiff < minSquaredDiff ) {
                    closestValX = dataPoints[dataIndex];
                    minSquaredDiff = currentSquaredDiff;
                }
                // If the squared differences are equal, pick the smaller actual value
                else if ( currentSquaredDiff == minSquaredDiff ) {
                    closestValX = dataPoints[dataIndex] < closestValX ? dataPoints[dataIndex] : closestValX;
                }
            }

            // Initialize a variable to accumulate total deviation
            var totalDeviation = 0;
            // Iterate through the data points again to calculate the sum of deviations from the closest value
            for ( var dataIndex = 0; dataIndex < dataPoints.length; dataIndex++ ) {
                // If the current data point is less than or equal to the closest value
                if ( dataPoints[dataIndex] <= closestValX ) {
                    totalDeviation += dataPoints[dataIndex] - closestValX;
                }
                // If the current data point is greater than the closest value
                else {
                    totalDeviation += ( -dataPoints[dataIndex] + closestValX );
                }
            }

            // Output the identified closest value and its calculated total deviation
            console.log( '%d %d', closestValX, totalDeviation );
        }
    }
}

// This line is responsible for reading input from standard input and invoking the main processing function.
// It should not be modified.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );