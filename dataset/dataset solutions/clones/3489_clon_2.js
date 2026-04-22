/*
 * This JavaScript module processes input data to identify the most cost-effective item
 * that adheres to a predefined time restriction. It outputs the minimum cost found
 * or indicates if no such item exists within the given constraints.
 */

// Acquire the raw input from the standard input stream,
// decoding it as UTF-8 and then segmenting it into an array of individual text lines.
const   sourceInputLines   =   require ( 'fs' )
                             . readFileSync ( '/dev/stdin' ,   'utf8' )
                             . split ( '\n' ) ;

// The initial line of the input contains global configuration parameters;
// extract these by removing the first line and splitting its contents by space.
let   configurationParameters   =   sourceInputLines . shift ( ) . split ( ' ' ) ;

// Convert the first parameter to a number, representing the total count of entries.
const   totalEntryCount   =   configurationParameters [ 0 ]   *   1 ;

// Convert the second parameter to a number, defining the maximum permissible time.
const   timeLimitThreshold   =   configurationParameters [ 1 ]   *   1 ;


// Initialize a variable to track the lowest cost found so far among valid items.
// A high initial value ensures any legitimate item's cost will be considered lower.
let   currentMinimumPrice   =   1000 ;

// A flag variable to signify whether any item satisfying the conditions
// (within time limit and potentially lowest cost) has been identified.
let   itemSuccessfullyLocated   =   0 ;


// Commence an iterative process through each of the input entries.
for ( let   entryIndex   =   0 ;   entryIndex   <   totalEntryCount ;   entryIndex ++ )
{
    // Parse the current entry's details, which typically include cost and duration.
    let   entrySpecifics   =   sourceInputLines [ entryIndex ] . split ( ' ' ) ;

    // Extract the cost component of the current entry, converting it to a numeric type.
    const   thisEntryCost   =   entrySpecifics [ 0 ]   *   1 ;

    // Extract the duration component of the current entry, converting it to a numeric type.
    const   thisEntryDuration   =   entrySpecifics [ 1 ]   *   1 ;

    // First, verify if the current entry's duration falls within the established time limit.
    if ( timeLimitThreshold   >=   thisEntryDuration )
    {
        // If the entry adheres to the time limit, then evaluate its cost.
        // Check if this entry's cost is lower than or equal to the currently recorded minimum price.
        if ( currentMinimumPrice   >=   thisEntryCost )
        {
            // If it is, update the minimum price to this new, lower cost.
            currentMinimumPrice   =   thisEntryCost ;

            // Set the flag to indicate that at least one suitable item has been found.
            itemSuccessfullyLocated   =   1 ;
        } // End of inner comparison: current price against recorded minimum
    } // End of outer check: entry duration against time limit
} // End of loop iterating through all entries


// Present the final outcome: either the determined minimum cost
// or the string 'TLE' (Time Limit Exceeded) if no valid item was found.
console . log ( itemSuccessfullyLocated   ?   currentMinimumPrice   :   'TLE' ) ;