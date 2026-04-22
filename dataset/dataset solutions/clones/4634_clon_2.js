// This function orchestrates the simulation process.
function ProcessSimulation(  rawData  )
{
    // The raw input string is first broken into individual lines.
    rawData = rawData.split( "\n" ) ;

    // The initial line contains global simulation parameters.
    rawData[0] = rawData[0].split( " " ) ;
    let elementCount   = parseInt( rawData[0][0], 10 ) ;
    let trackLength    = parseInt( rawData[0][1], 10 ) ;
    let elapsedTime    = parseInt( rawData[0][2], 10 ) ;

    // Arrays are initialized to hold the state of each simulated entity.
    let initialPositions, movementDirections, finalPositionsAdjusted, collisionOffsets ;
    initialPositions         = new Array( 100001 ) ;
    movementDirections       = new Array( 100001 ) ;
    finalPositionsAdjusted   = new Array( 100001 ) ;
    collisionOffsets         = new Array( 100001 ) ;

    // Populate entity data from subsequent input lines.
    for ( let loopCounter = 0 ; loopCounter < elementCount ; loopCounter ++ )
    {
        rawData[ loopCounter + 1 ] = rawData[ loopCounter + 1 ].split( " " ) ;
        initialPositions[ loopCounter ]   = parseInt( rawData[ loopCounter + 1 ][0], 10 ) ;
        movementDirections[ loopCounter ] = parseInt( rawData[ loopCounter + 1 ][1], 10 ) ;
        collisionOffsets[ loopCounter ]   = 0 ; // Default collision count for this entity.
    }
 
    // Calculate the final theoretical position for each entity after 'elapsedTime',
    // without considering any physical interactions (collisions).
    for ( let loopCounter = 0 ; loopCounter < elementCount ; loopCounter ++ )
    {
        let directionFactor ;
        if ( movementDirections[ loopCounter ] === 1 )
            directionFactor = 1 ;
        else
            directionFactor = -1 ;
        
        finalPositionsAdjusted[ loopCounter ] = ( initialPositions[ loopCounter ] + elapsedTime * directionFactor ) % trackLength ;
        
        // Ensure that positions are always positive within the track length.
        if ( finalPositionsAdjusted[ loopCounter ] < 0 )
            finalPositionsAdjusted[ loopCounter ] += trackLength ;
    }

    // Compute the 'collision offset' for each entity relative to the first entity (index 0).
    // This accounts for how many times entities might have "passed through" each other.
    for ( let loopCounter = 1 ; loopCounter < elementCount ; loopCounter ++ )
    {
        if ( movementDirections[0] === movementDirections[ loopCounter ] )
        {
            // If entities move in the same direction, their relative order doesn't change due to collisions.
            collisionOffsets[ loopCounter ] = 0 ;
        }
        else
        {
            let timeDelta = elapsedTime * 2 ; // Total time for two-way travel.
            
            let posA, posB ; // Temporary holders for comparison.
            
            if ( movementDirections[0] === 1 )
            {
                posA = initialPositions[0] ;
                posB = initialPositions[ loopCounter ] ;
            }
            else
            {
                posA = initialPositions[ loopCounter ] ;
                posB = initialPositions[0] ;
            }
            
            collisionOffsets[ loopCounter ] = 0 ; // Reset offset for current entity.
            
            // Adjust timeDelta based on initial relative positions.
            if ( posB >= posA )
            {
                 timeDelta -= posB - posA ;
            }
            else
            {
                timeDelta -= trackLength - posA + posB ;
            }
            
            // Count initial "pass-through" if timeDelta is sufficient.
            if ( timeDelta >= 0 )
            collisionOffsets[ loopCounter ] ++ ;
            else
                timeDelta = 0 ; // No effective time for collisions if negative.
            
            // Add full laps of relative collisions.
            collisionOffsets[ loopCounter ] += Math.floor( timeDelta / trackLength ) ;
        }
    }
    
    // Aggregate all individual collision offsets.
    let cumulativeOffset = 0 ;
    
    for ( let loopCounter = 1 ; loopCounter < elementCount ; loopCounter ++ )
    {
        cumulativeOffset += collisionOffsets[ loopCounter ] ;
    }
    cumulativeOffset %= elementCount ; // Normalize the total offset.
    
    // Additional adjustment based on the first entity's direction.
    if ( movementDirections[0] === 2 )
        cumulativeOffset = ( elementCount - cumulativeOffset ) % elementCount ;
        
    // Store the final position of the first entity (after motion, before sort).
    let targetPosition = finalPositionsAdjusted[0] ;
    
    // Add a large sentinel value to help with sorting logic later.
    finalPositionsAdjusted[ elementCount ] = 10000000000 ;
    
    // Sort all final positions.
    finalPositionsAdjusted.sort( function ( val1, val2 ) {
        if ( val1 < val2 ) return -1 ;
        if ( val1 > val2 ) return 1 ;
        return 0 ;
    } ) ;
    
    let displayStartIdx ; // This will be the index from where we start printing.
    
    // Add another sentinel value for robust index finding.
    finalPositionsAdjusted[ elementCount ] = -1000 ;
    
    // Determine the actual starting index for output based on the first entity's effective final position.
    for ( let loopCounter = 0 ; loopCounter < elementCount ; loopCounter ++ )
    {
        if ( finalPositionsAdjusted[ loopCounter ] === targetPosition && finalPositionsAdjusted[ ( loopCounter + 1 ) % elementCount ] !== targetPosition )
        {
            displayStartIdx = loopCounter ;
            break ;
        }
        else if ( finalPositionsAdjusted[ loopCounter ] === targetPosition && finalPositionsAdjusted[ ( loopCounter + 1 ) % elementCount ] === targetPosition )
        {
            // Handle scenarios where multiple entities end up at the same final position.
            if ( movementDirections[0] === 1 )
                displayStartIdx = loopCounter + 1 ;
            else
                displayStartIdx = loopCounter ;
            break ;
        }
    }
    
    // Apply the total collision offset to determine the final starting point for the cyclic output.
    displayStartIdx = ( elementCount + displayStartIdx - cumulativeOffset ) % elementCount ;

    // Print the final, sorted positions, starting from the calculated index, in a cyclic manner.
    for ( let loopCounter = 0 ; loopCounter < elementCount ; loopCounter ++ )
    {
        console.log( finalPositionsAdjusted[ displayStartIdx ++ ] ) ;
        if ( displayStartIdx === elementCount )
            displayStartIdx = 0 ; // Wrap around to the beginning of the array.
    }
}


// Entry point: Read input from standard input and pass it to the processing function.
ProcessSimulation(
    require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' )
)