( function( inputDataStream ) {
  // This section processes the initial input string, breaking it into distinct lines.
  var inputSegments = inputDataStream.trim().split('\n');

  // The main operational loop continues indefinitely until a specific signal is received.
  while ( true ) {
    // Retrieve the next available line segment from our collection.
    var currentSegment = inputSegments.shift();

    // Evaluate if the current segment indicates the termination of input processing.
    if ( currentSegment === '0' ) {
      break; // Exit the processing loop.
    }

    // Convert the string segment into a numerical value representing the total number of items to find.
    var numTreasures = Number(currentSegment);

    // Initialize an associative array (object) to record the precise coordinates of all hidden items.
    var treasureLocations = {};

    // Iterate through the input to populate our map of treasure coordinates.
    for ( var treasureIdx = 0; treasureIdx < numTreasures; treasureIdx++ ) {
      // Each treasure's location is stored as a key; a value of '1' signifies its presence.
      treasureLocations[inputSegments.shift().trim()] = 1;
    }

    // The subsequent segment specifies the total count of movement directives to follow.
    var numMoves = Number(inputSegments.shift().trim());

    // Establish the initial position for our explorer on a 2D grid.
    var currentXCoord = 10, currentYCoord = 10;

    // Define a lookup table for coordinate changes based on cardinal directions.
    var movementVectors = {
      'N': [0, 1],  // North: Increment Y-coordinate
      'S': [0, -1], // South: Decrement Y-coordinate
      'E': [1, 0],  // East: Increment X-coordinate
      'W': [-1, 0]  // West: Decrement X-coordinate
    };

    // A counter to keep track of how many items have been successfully acquired.
    var collectedCount = 0;

    // Process each movement directive sequentially.
    for ( var moveIdx = 0; moveIdx < numMoves; moveIdx++ ) {
      // Parse the current command, separating the direction from the number of steps.
      var commandParts = inputSegments.shift().trim().split(' ');
      var moveDirection = commandParts[0];      // The directional indicator (e.g., 'N', 'S').
      var numSteps = Number(commandParts[1]); // The magnitude of movement for this command.

      // Execute each individual step as specified by the current directive.
      for ( var stepCounter = 0; stepCounter < numSteps; stepCounter++ ) {
        // Adjust the explorer's horizontal position.
        currentXCoord += movementVectors[moveDirection][0];
        // Adjust the explorer's vertical position.
        currentYCoord += movementVectors[moveDirection][1];

        // Construct a unique string key representing the explorer's current coordinates.
        var locationKey = [currentXCoord, currentYCoord].join(' ');

        // Verify if a treasure is present at the explorer's current location and has not been collected yet.
        if ( treasureLocations[locationKey] ) {
          collectedCount++; // Increment the tally of gathered items.
          treasureLocations[locationKey] = 0; // Mark the item as collected to prevent re-collection.
        }
      }
    }

    // Output the final verdict: 'Yes' if all items were found, 'No' otherwise.
    console.log( ( collectedCount === numMoves ) ? 'Yes' : 'No' );
  }
} ) ( require('fs').readFileSync('/dev/stdin', 'utf8') ); // The entire script is wrapped in an immediately invoked function expression (IIFE)