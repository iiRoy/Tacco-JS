function simulateRestaurant ( ) {

    // Initialize the state of the dining area
    var tableOccupancy = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    // Define the sizes of the arriving guest parties
    var partySizes = [ 2, 5, 2, 2, 2 ];
    // Set the duration each party will spend dining
    var diningDurations = [ 19, 39, 25, 36, 22, 42 ];

    var currentPartyId = -1; // Identifier for the group currently waiting to be seated
    var timeElapsed = 0; // Tracks the passage of time in the simulation
    var customerWaitTimes = [ ]; // Stores the waiting time for each seated party

    // Main simulation loop: continues until 100 customer wait times are recorded
    while ( customerWaitTimes.length < 100 ) {

        // Cycle through all tables to decrement their occupation timers
        for ( var seatIdx = 0; seatIdx < tableOccupancy.length; seatIdx++ ) {
            tableOccupancy[seatIdx] = ( tableOccupancy[seatIdx] === 0 ) ? 0 : tableOccupancy[seatIdx] - 1;
        }

        // Check for a new party arrival
        // A new party arrives every 5 time units if no party is currently waiting
        if ( currentPartyId === -1 && ( timeElapsed % 5 ) === 0 ) {
            currentPartyId = timeElapsed / 5;
        }

        // Attempt to seat the waiting party
        while ( currentPartyId !== -1 ) {
            var requiredConsecutiveSeats = partySizes[ currentPartyId % 5 ]; // Determine needed seats for this party
            var foundConsecutiveSpots = 0; // Counter for available adjacent spots
            var seatingStartSpot = -1; // Index of the first available spot for seating

            // Scan the table layout for a suitable block of seats
            for ( var iter = 0; iter < tableOccupancy.length; iter++ ) {
                foundConsecutiveSpots = ( tableOccupancy[iter] === 0 ) ? foundConsecutiveSpots + 1 : 0;

                // If enough consecutive spots are found
                if ( foundConsecutiveSpots === requiredConsecutiveSeats ) {
                    seatingStartSpot = iter - ( requiredConsecutiveSeats - 1 );
                    break;
                }
            }

            // If a seating arrangement was found
            if ( seatingStartSpot !== -1 ) {
                // Record the time this party waited before being seated
                customerWaitTimes[ currentPartyId ] = timeElapsed - ( currentPartyId * 5 );
                // Occupy the found seats for the duration of their meal
                for ( var fillIdx = seatingStartSpot; fillIdx < ( requiredConsecutiveSeats + seatingStartSpot ); fillIdx++ ) {
                    tableOccupancy[ fillIdx ] = diningDurations[ currentPartyId % 6 ];
                }

                // Advance to the next potential party, if their arrival time has passed
                currentPartyId = ( ( ( currentPartyId + 1 ) * 5 ) <= timeElapsed ) ? currentPartyId + 1 : -1;
            } else {
                // No suitable seating found for the current party, they continue to wait
                break;
            }

        }

        timeElapsed++; // Increment the simulation clock
    }

    // Output the recorded waiting times based on the provided input indices
    for ( var outputIdx = 0; outputIdx < ( rawInputBuffer.length - 1 ); outputIdx++ ) {
        console.log( customerWaitTimes[ parseInt( rawInputBuffer[ outputIdx ], 10 ) ] );
    }

}


var rawInputBuffer = ''; // Buffer to accumulate incoming standard input

process.stdin.resume(); // Keep the process alive for input
process.stdin.setEncoding( 'utf8' ); // Expect UTF-8 encoded input
process.stdin.on( 'data', function ( dataChunk ) {
    rawInputBuffer += dataChunk; // Append received data to the buffer
} );
process.stdin.on( 'end', function () {
    rawInputBuffer = rawInputBuffer.split( '\n' ); // Split the buffer into lines
    simulateRestaurant(); // Execute the simulation with the processed input
} );