( function( dataSource ) { // Anonymous function wrapping the main process
    // Split the entire input string into an array of individual lines.
    let linesArray = dataSource.split( '\n' ) ;
    // Extract the first line, convert it to a number, representing the count of items.
    const itemCount = Number( linesArray.shift() ) ;
    // Create the primary list of items from the remaining lines based on the item count.
    let primaryList = linesArray.slice( 0, itemCount ) ;
    // Make a deep copy of the primary list to preserve original order for stability checking.
    const backupList = [].concat( primaryList ) ;

    // Perform the quicksort-like division and sorting on the primary list.
    divideAndSort( primaryList, 0, primaryList.length - 1 ) ;
    // Output whether the sorting was stable or not by comparing the original and sorted lists.
    process.stdout.write( ( verifyStability( backupList, primaryList ) ? 'Stable' : 'Not stable' ) + '\n' ) ;
    // Print the sorted list, joining elements back with newlines.
    process.stdout.write( primaryList.join( '\n' ) + '\n' ) ;
} ) ( require( 'node:fs' ).readFileSync( '/dev/stdin', 'utf8' ) ) ; // Execute with file system input


/**
 * Extracts the numerical component from a string item.
 * Assumes the number starts from the second character to the end.
 * @param {string} itemString The string from which to extract the number.
 * @returns {number} The extracted numeric value.
 */
function extractNumericValue( itemString ) {
    // A debug print statement was here, now removed or commented differently.
    // console.debug( itemString );
    return Number( itemString.slice( 1, itemString.length ) ) ;
}


/**
 * Gathers a concatenated string of elements from a collection
 * whose extracted numeric value matches a specified target number.
 * @param {string[]} itemCollection The array of strings to search through.
 * @param {number} targetNumber The numeric value to match.
 * @returns {string} A combined string of matching elements.
 */
function filterByNumericValue( itemCollection, targetNumber ) {
    let filteredString = '' ; // Initialize an empty string to accumulate results.
    for ( let currentIdx = 0 ; currentIdx < itemCollection.length ; currentIdx++ ) {
        // If the numeric part of the current item matches the target, append it.
        if ( extractNumericValue( itemCollection[ currentIdx ] ) === targetNumber ) {
            filteredString += itemCollection[ currentIdx ] ;
        }
    }
    return filteredString ;
}


/**
 * Compares two lists for stability based on their numeric components.
 * It checks if the relative order of elements with identical numeric values is preserved.
 * @param {string[]} originalCollection The initial, unsorted collection.
 * @param {string[]} sortedCollection The collection after sorting.
 * @returns {boolean} True if the sort is stable, false otherwise.
 */
function verifyStability( originalCollection, sortedCollection ) {
    let iterationCounter = 0 ; // Initialize a counter for iterating through the lists.
    while ( iterationCounter < sortedCollection.length ) {
        // Get the numeric value of the current element from the original collection.
        const currentNumericalValue = extractNumericValue( originalCollection[ iterationCounter ] ) ;
        // Compare the combined string of elements with this numeric value from both collections.
        if ( filterByNumericValue( originalCollection, currentNumericalValue ) !== filterByNumericValue( sortedCollection, currentNumericalValue ) ) {
            return false ; // If they don't match, the sort is not stable.
        }
        iterationCounter++ ; // Move to the next element.
    }
    return true ; // If all checks pass, the sort is stable.
}


/**
 * Implements a recursive quicksort partitioning scheme.
 * It selects a pivot element and rearranges the array such that elements
 * less than or equal to the pivot are on its left, and greater elements on its right.
 * @param {string[]} targetArray The array to be partitioned.
 * @param {number} startIndex The starting index for the current partition.
 * @param {number} endIndex The ending index for the current partition.
 */
function divideAndSort( targetArray, startIndex, endIndex ) {
    // Optional debug logging, now removed or changed.
    // console.debug( startIndex, endIndex );
    if ( startIndex >= endIndex ) {
        return; // Base case: if the segment has one or zero elements, it's already sorted.
    }

    const pivotElement = targetArray[ endIndex ] ; // Choose the last element as the pivot.
    let leftBoundary = startIndex - 1 ; // Pointer for the boundary of elements less than or equal to pivot.

    for ( let scanIterator = startIndex ; scanIterator <= endIndex - 1 ; scanIterator++ ) {
        // If the current element's numeric value is less than or equal to the pivot's numeric value.
        if ( extractNumericValue( targetArray[ scanIterator ] ) <= extractNumericValue( pivotElement ) ) {
            leftBoundary++ ; // Increment the left boundary pointer.
            // Swap the element at leftBoundary with the current element.
            let temporaryHolder = targetArray[ leftBoundary ] ;
            targetArray[ leftBoundary ] = targetArray[ scanIterator ] ;
            targetArray[ scanIterator ] = temporaryHolder ;
        }
    }

    // After the loop, place the pivot element in its correct sorted position.
    // If the pivot is already in its correct spot (e.g., all elements smaller), no swap needed.
    if ( leftBoundary + 1 === endIndex ) {
        return; // All elements were already smaller than or equal to pivot, no further pivot swap needed.
    }
    let temporaryHolder = targetArray[ leftBoundary + 1 ] ;
    targetArray[ leftBoundary + 1 ] = targetArray[ endIndex ] ;
    targetArray[ endIndex ] = temporaryHolder ;

    // Recursively apply partitioning to the sub-arrays on either side of the pivot.
    divideAndSort( targetArray, startIndex, leftBoundary + 1 ) ; // Left partition
    divideAndSort( targetArray, leftBoundary + 1, endIndex ) ; // Right partition (excluding the pivot)
}