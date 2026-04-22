function calculateTravelCost(receivedContent)
{
    /* This section parses the raw input string
     * into an array of individual lines for further processing. */
    var textLines = receivedContent.split('\n');


    // The very first line contains crucial configuration parameters.
    var initialConfig = textLines[0] . split ( ' ' ) ;

    // Retrieve the total number of points/locations from the first part.
    var numLocations = parseInt( initialConfig[0] );

    // Extract the cost factor per unit of distance for travel.
    var ratePerDistance = parseInt( initialConfig[1] );

    // Determine the maximum allowable cost for any single segment of the journey.
    var fixedCap = parseInt( initialConfig[2] );

    // Parse the second line, which contains the coordinates/positions of the locations.
    var locationCoordinates = textLines[1].split(' ').map(  (numStr) => parseInt(numStr)  ) ;


    // Initialize a variable to accumulate the total calculated expenditure for the entire trip.
    var totalCost = 0;

    /* Iterate through each consecutive pair of locations
     * to compute the cost of traversing each segment between them. */
    for ( var segmentIndex = 0 ; segmentIndex < numLocations - 1 ; segmentIndex++ )
    {
        // Calculate the distance traveled between the current and the next location.
        var distanceTraveled = locationCoordinates[segmentIndex + 1] - locationCoordinates[segmentIndex];
        // Compute the cost based on distance and the per-unit rate, then cap it with the fixed maximum.
        var segmentExpenditure = Math.min( ratePerDistance * distanceTraveled , fixedCap ) ;
        // Add the segment's calculated cost to the running total expenditure.
        totalCost += segmentExpenditure ;
    }

    // Display the final computed total cost to the standard output stream.
    console.log( totalCost ) ;
}

/* This part handles reading the input from the standard input stream
 * using the Node.js 'fs' module, and then invokes the primary processing
 * function with that content to begin calculations. */
calculateTravelCost( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;