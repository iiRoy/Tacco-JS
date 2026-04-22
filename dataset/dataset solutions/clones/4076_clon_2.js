function processTravelPlan (rawInputString)
{
    // The incoming raw string data needs to be parsed.
    // It's split by newline characters, then each line by spaces,
    // and finally, each resulting string segment is converted into a numeric value.
    const processedTrips = rawInputString
        .split( "\n" )
        .map(  (lineStr) => {
                 return lineStr
                     .split( " " )
                     .map(  (coordStr) => Number(coordStr)  )
                 ;
            }  )
    ;

    // The first entry in the processed data typically represents the count
    // of subsequent travel points, though it's not directly used in the core logic.
    const numTravelPoints = processedTrips[0][0];

    // Extract the array of actual travel segments, omitting the initial count.
    const tripRecords = processedTrips.slice(1);

    // Initialize the starting conditions: time, x-coordinate, and y-coordinate at the origin.
    let previousTime = 0;
    let previousX = 0;
    let previousY = 0;

    // A boolean flag to track the overall feasibility of the entire journey.
    // It is assumed to be feasible until proven otherwise.
    let journeyIsValid = true;

    // Iterate through each planned travel segment to assess its validity.
    for ( const segmentData of tripRecords )
    {
        // Deconstruct the current segment's details into target time and coordinates.
        const nextTime = segmentData[0];
        const nextX = segmentData[1];
        const nextY = segmentData[2];

        // Calculate the absolute change in the X and Y dimensions from the previous point.
        const xDistance = Math.abs(nextX - previousX);
        const yDistance = Math.abs(nextY - previousY);

        // Determine the duration of the current travel segment.
        const timeElapsed = nextTime - previousTime;

        // Apply the two core conditions for a valid movement:
        // 1. The total Manhattan distance must not exceed the time available.
        // 2. The parity (evenness or oddness) of the total distance must match the parity of the time elapsed.
        if (  !  (  (xDistance + yDistance <= timeElapsed)  &&  (nextTime % 2 === (xDistance + yDistance) % 2)  )  )
        {
            journeyIsValid = false; // If conditions are not met, the journey is deemed invalid.
            // The original code does not break the loop here, so we continue checking subsequent segments
            // even if the journey is already known to be invalid, to maintain identical structure.
        }

        // Update the 'previous' state variables for the next iteration of the loop.
        previousTime = nextTime;
        previousX = nextX;
        previousY = nextY;
    }

    // Formulate the final output message based on the journey's validity.
    const validityStatus = journeyIsValid ? "Yes" : "No";

    // Display the computed status to the standard output.
    console.log(validityStatus);
}

// Invoke the travel plan processing function, reading input from the standard input stream.
processTravelPlan(require('fs').readFileSync('/dev/stdin', 'utf8'));