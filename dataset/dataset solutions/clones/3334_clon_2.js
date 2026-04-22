let dataValues; // This array stores the numerical values for processing.
let intervalCache; // This 2D array serves as a memoization table for subproblem solutions.

// The primary entry point for the application, handling input parsing and initial setup.
function ApplicationEntry ( programInput ) {

    // First, process the raw text input.
    // It's trimmed, then split into individual lines, and each line is further split by spaces.
    const parsedData = programInput
        .trim()
        .split("\n")
        .map( function ( lineSegment ) {
            return lineSegment.split(" ")
        } )
    ; // End of input parsing chain.

    // Extract the total count of items from the first part of the input data.
    const totalItems = parseInt( parsedData[0][0], 10 ) ;

    // Convert the second line of input into an array of integers.
    // This 'dataValues' array is intended to be accessible globally for the recursive function.
    dataValues = parsedData[1]
        .map( itemText => parseInt( itemText, 10 ) )
    ;

    // Initialize the memoization table with a size corresponding to the total number of items.
    // Each inner array starts empty, ready to store computed range results.
    intervalCache = Array.from( { length: totalItems }, () => [] ) ;

    // Finally, invoke the core dynamic programming function to find the optimal result
    // for the entire range, and display this result to the console.
    console.log( DetermineOptimal( 0, totalItems - 1 ) ) ;
}


// This recursive function, enhanced with memoization, calculates the optimal value
// for a specified range [startPos, finish].
// It relies on the globally defined 'dataValues' and 'intervalCache' structures.
function DetermineOptimal ( startPos, finish ) {

    // Check if the solution for the current range [startPos, finish] has already been computed
    // and stored in the memoization table. If so, return the cached value directly.
    if ( intervalCache[startPos][finish] != null ) {
        return intervalCache[startPos][finish] ;
    }

    // Base Case 1: If the range consists of exactly two elements (e.g., [x, y]).
    // The result is the absolute difference between these two elements.
    if ( finish === startPos + 1 ) {
        intervalCache[startPos][finish] = Math.abs( dataValues[startPos] - dataValues[finish] ) ;
        return intervalCache[startPos][finish] ;
    }

    // Base Case 2: If the range consists of a single element (e.g., [x, x]).
    // The result is simply the value of that element.
    if ( finish === startPos ) {
        intervalCache[startPos][finish] = dataValues[startPos] ;
        return intervalCache[startPos][finish] ;
    }

    // Recursive Step: Explore two possible paths to derive the optimal solution for the current range.

    // Path 1: Consider taking the element at 'startPos' and subtracting the optimal result
    // from the remaining sub-range (excluding 'startPos').
    const choiceOne = dataValues[startPos] - DetermineOptimal( startPos + 1, finish ) ;

    // Path 2: Consider taking the element at 'finish' and subtracting the optimal result
    // from the remaining sub-range (excluding 'finish').
    const choiceTwo = dataValues[finish] - DetermineOptimal( startPos, finish - 1 ) ;

    // Store the maximum value obtained from the two choices in the memoization table
    // for the current range [startPos, finish].
    intervalCache[startPos][finish] = Math.max( choiceOne, choiceTwo ) ;

    // Return the newly computed optimal value for this range.
    return intervalCache[startPos][finish] ;
}

// Initiate the application by calling the main entry function.
// It reads input from standard input, typically used in competitive programming environments.
ApplicationEntry( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;