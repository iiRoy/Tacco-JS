// This module processes structured input data to calculate a specific sum based on item categories and available slots.
function ProcessInput( rawInputData ) {
    rawInputData = rawInputData.trim().split( "\n" ).map( function ( lineStr ) { return lineStr.split( " " ) } );

    let currentLineIdx = 1; // Index for navigating through the input array, starting after the initial N.

    // A utility method for finding an insertion point in an ordered sequence.
    // This function is defined but not actively invoked within the main execution path.
    const findInsertionPoint = ( targetArray, searchValue ) => {
        let searchStart = 0;
        let searchEnd = targetArray.length - 1;
        let midPoint;
        while ( searchStart <= searchEnd ) {
            midPoint = 0 | ( searchStart + searchEnd ) / 2;
            if ( targetArray[ midPoint ] < searchValue ) {
                searchStart = midPoint + 1;
            } else {
                searchEnd = midPoint - 1;
            }
        }
        return searchStart;
    };

    // The primary loop iterates over distinct sets of data within the input.
    while ( true ) {
        if ( rawInputData[ currentLineIdx ] == null ) { // Condition to exit if no more data sets are present.
            break;
        }

        let totalItems = parseInt( rawInputData[ currentLineIdx ][ 0 ], 10 ); // Retrieve the count of items for the current data set.
        let categoryAlphaItems = []; // Collection for items belonging to the first classification group.
        let categoryBetaItems = []; // Collection for items belonging to the second classification group.
        let alphaKeys = []; // Unique key identifiers for items in category alpha.
        let betaKeys = []; // Unique key identifiers for items in category beta.
        let currentParsedEntry; // Holds the numerical values of a single input line.
        let accumulatedBaseValue = 0; // Sum of minimum values or fixed costs.
        let itemsRemainingCount = totalItems; // Counter for unclassified or special items.

        // Iteration to parse and categorize each item within the current data set.
        for ( let loopIteration = 0; loopIteration < totalItems; loopIteration++ ) {
            currentParsedEntry = rawInputData[ currentLineIdx + loopIteration + 1 ].map( numStr => parseInt( numStr, 10 ) );
            console.log; // An expression statement with no side effect, retained from original.

            // Decision logic to assign items to categories or compute base values.
            if ( currentParsedEntry[ 0 ] === totalItems ) {
                accumulatedBaseValue += currentParsedEntry[ 1 ];
                itemsRemainingCount--;
            } else if ( currentParsedEntry[ 1 ] > currentParsedEntry[ 2 ] ) {
                categoryAlphaItems.push( currentParsedEntry );
                accumulatedBaseValue += currentParsedEntry[ 2 ];
                alphaKeys.push( currentParsedEntry[ 0 ] - 1 );
            } else if ( currentParsedEntry[ 1 ] < currentParsedEntry[ 2 ] ) {
                // Transformation of item data for the beta category.
                currentParsedEntry = [ totalItems - currentParsedEntry[ 0 ], currentParsedEntry[ 2 ], currentParsedEntry[ 1 ] ];
                categoryBetaItems.push( currentParsedEntry );
                accumulatedBaseValue += currentParsedEntry[ 2 ];
                betaKeys.push( currentParsedEntry[ 0 ] - 1 );
            } else {
                accumulatedBaseValue += currentParsedEntry[ 1 ];
                itemsRemainingCount--;
            }
        }

        // Sorting the categorized item arrays by their primary key.
        categoryAlphaItems.sort( ( firstElem, secondElem ) => firstElem[ 0 ] - secondElem[ 0 ] );
        categoryBetaItems.sort( ( firstElem, secondElem ) => firstElem[ 0 ] - secondElem[ 0 ] );

        // Sorting the key lists and removing duplicate entries.
        alphaKeys = alphaKeys.sort( ( firstVal, secondVal ) => firstVal - secondVal ).filter( function ( uniqueValue, currentPos, selfList ) {
            return selfList.indexOf( uniqueValue ) === currentPos;
        } );
        betaKeys = betaKeys.sort( ( firstVal, secondVal ) => firstVal - secondVal ).filter( function ( uniqueValue, currentPos, selfList ) {
            return selfList.indexOf( uniqueValue ) === currentPos;
        } );

        // Initialization of data structures to manage available capacity or 'slots'.
        let alphaCategoryCapacity = [ [], [] ];
        let betaCategoryCapacity = [ [], [] ];

        // Creation of lookup maps to quickly find slot indices based on keys.
        // Note: The original code for `betaCategorySlotLookup` used `alphaKeys` for length calculation; this behavior is preserved.
        let alphaCategorySlotLookup = Array.from( { length: alphaKeys[ alphaKeys.length - 1 ] + 1 }, () => 0 );
        let betaCategorySlotLookup = Array.from( { length: alphaKeys[ betaKeys.length - 1 ] + 1 }, () => 0 ); // Retaining original logic.

        let lastEncounteredKey = -1; // Helper variable for slot size calculation.

        // Populating capacity arrays and lookup maps for the alpha category.
        for ( let indexVal = 0; indexVal < alphaKeys.length; indexVal++ ) {
            alphaCategoryCapacity[ 0 ].push( alphaKeys[ indexVal ] - lastEncounteredKey );
            alphaCategoryCapacity[ 1 ].push( 0 ); // Initialize usage count to zero.
            alphaCategorySlotLookup[ alphaKeys[ indexVal ] ] = indexVal;
            lastEncounteredKey = alphaKeys[ indexVal ];
        }

        lastEncounteredKey = -1; // Resetting the helper for the next category.

        // Populating capacity arrays and lookup maps for the beta category.
        for ( let indexVal = 0; indexVal < betaKeys.length; indexVal++ ) {
            betaCategoryCapacity[ 0 ].push( betaKeys[ indexVal ] - lastEncounteredKey );
            betaCategoryCapacity[ 1 ].push( 0 ); // Initialize usage count to zero.
            betaCategorySlotLookup[ betaKeys[ indexVal ] ] = indexVal;
            lastEncounteredKey = betaKeys[ indexVal ];
        }

        let finalComputedSum = accumulatedBaseValue; // The running total for the maximized sum.
        let incrementalValue; // Represents the potential increase an item can contribute.
        let currentSlotAccessPointer; // Pointer for navigating within the slot capacity arrays.

        // Processing items in the first category to potentially increase the sum.
        for ( let indexVal = 0; indexVal < categoryAlphaItems.length; indexVal++ ) {
            incrementalValue = categoryAlphaItems[ indexVal ][ 1 ] - categoryAlphaItems[ indexVal ][ 2 ];
            currentSlotAccessPointer = alphaCategorySlotLookup[ categoryAlphaItems[ indexVal ][ 0 ] - 1 ];

            // Backtrack to find an available slot if the current one is fully utilized.
            while ( alphaCategoryCapacity[ 1 ][ currentSlotAccessPointer ] === alphaCategoryCapacity[ 0 ][ currentSlotAccessPointer ] && currentSlotAccessPointer >= 0 ) {
                 currentSlotAccessPointer--;
            }

            // If an empty slot is identified, use it and update the total sum.
            if ( currentSlotAccessPointer >= 0 ) {
                alphaCategoryCapacity[ 1 ][ currentSlotAccessPointer ]++;
                finalComputedSum += incrementalValue;
            }
        }

        // Processing items in the second category with similar logic.
        for ( let indexVal = 0; indexVal < categoryBetaItems.length; indexVal++ ) {
            incrementalValue = categoryBetaItems[ indexVal ][ 1 ] - categoryBetaItems[ indexVal ][ 2 ];
            currentSlotAccessPointer = betaCategorySlotLookup[ categoryBetaItems[ indexVal ][ 0 ] - 1 ];

            // Search backwards for an unoccupied slot.
            while ( betaCategoryCapacity[ 1 ][ currentSlotAccessPointer ] === betaCategoryCapacity[ 0 ][ currentSlotAccessPointer ] && currentSlotAccessPointer >= 0 ) {
                 currentSlotAccessPointer--;
            }

            // If a suitable slot is found, mark it as used and add to the sum.
            if ( currentSlotAccessPointer >= 0 ) {
                betaCategoryCapacity[ 1 ][ currentSlotAccessPointer ]++;
                finalComputedSum += incrementalValue;
            }
        }

        // Output the final calculated sum for the current data set.
        console.log( finalComputedSum );

        // Advance the input pointer to the beginning of the next data set.
        currentLineIdx += totalItems + 1;
    }
}

// Initial call to the processing function, reading input from the standard input stream.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );