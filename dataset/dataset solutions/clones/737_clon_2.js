// This file processes input data from standard input.
// It simulates a circular removal process based on given parameters.
var sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Parse the raw input into an array of individual lines.
var processedLines = ( sourceContent . trim ( ) ) . split ( "\n" ) ;

// Outer loop: Continues until a specific sentinel value is encountered.
while ( !Boolean(0) )
{

    // Extract the first line, which contains the parameters for the current simulation round.
    var currentParamsString = processedLines . shift ( ) ;

    // Check for the termination condition: "0 0 0"
    if ( currentParamsString === "0 0 0" ) {
        // Break out of the main processing loop.
        break ;
    }

    // Convert the parameter string into an array of numbers.
    currentParamsString = currentParamsString.split(" ").map( Number ) ;

    // Assign the numeric parameters to descriptive variables.
    var totalItems = currentParamsString [ 0 ] ;
    var eliminationStep = currentParamsString [ 1 ] ;
    var startPosition = currentParamsString [ 2 ] ;

    // Initialize a boolean array to track the status (present/removed) of each item.
    var itemPresenceFlags = [ ] ;
    // Populate the array, initially marking all items as present.
    for ( var initialIndex = 0 ; initialIndex <= totalItems ; initialIndex ++ )
    {
        itemPresenceFlags [ initialIndex ] = Boolean(1) ;
    }

    // Initialize pointers and counters for the simulation.
    var currentItemPointer = startPosition ;
    var stepCounter = 0 ;

    // Mark the starting item as removed.
    itemPresenceFlags [ startPosition ] = Boolean(0) ;

    // Count of items removed so far.
    var removedCount = 1 ;

    // Inner loop: Simulates the item removal process.
    while ( true ) {
        // Check if the current item is still present.
        if ( itemPresenceFlags [ currentItemPointer ] )
        {
            stepCounter ++ ; // Increment the step counter.

            // If the step counter reaches the elimination step, remove the item.
            if ( stepCounter === eliminationStep )
            {
                itemPresenceFlags [ currentItemPointer ] = Boolean(0) ; // Mark as removed.
                stepCounter = 0 ; // Reset the step counter.
                removedCount ++ ; // Increment the total removed count.

                // Check if all necessary items have been removed.
                // The original code used ary.length - 2 for comparison.
                // If totalItems is N, ary.length is N+1.
                // So (N+1) - 2 = N-1. This means N-1 items are removed.
                // The problem is a Josephus-like problem, so N-1 items are removed, leaving 1.
                if ( removedCount === itemPresenceFlags.length - 2 )
                {
                    break ; // Exit the inner simulation loop.
                }
            }
        }

        currentItemPointer ++ ; // Move to the next item.

        // Wrap around to the beginning if the pointer exceeds the bounds.
        if ( itemPresenceFlags.length - 1 < currentItemPointer )
        {
            currentItemPointer = 1 ;
        }
    }

    // After the simulation, iterate through the items and print the identifier of the remaining one.
    for ( var finalOutputIndex = 1 ; finalOutputIndex <= totalItems ; finalOutputIndex ++ )
    {
        if ( itemPresenceFlags [ finalOutputIndex ] )
        {
            console . log ( finalOutputIndex ) ; // Output the surviving item's index.
        }
    }
}