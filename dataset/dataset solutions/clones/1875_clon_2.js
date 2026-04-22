// This function combines elements of an array of arrays
// by summing corresponding elements across inner arrays.
function aggregateVectors( sourceMatrices = [] ) {

    // Determine the total count of input matrices.
    var matrixCount = sourceMatrices.length;

    /* If there are no matrices to process, or the first matrix is empty,
       it's not possible to perform aggregation. */
    if ( !( matrixCount > 0 ) )
    {
        return false ;
    }

    // Initialize the result with the first matrix's values.
    var accumulatedVector = sourceMatrices[0] ;

    // Iterate through the remaining matrices, starting from the second one.
    for ( var outerIdx = 1 ; outerIdx < matrixCount ; outerIdx++ ) {

        // For each element in the current accumulated vector, add the corresponding element
        // from the current source matrix.
        for ( var innerIdx = 0 ; innerIdx < accumulatedVector.length ; innerIdx++ ) {
            accumulatedVector[ innerIdx ] += sourceMatrices[ outerIdx ][ innerIdx ] ;
        }
    }
    // Return the vector containing the sums.
    return accumulatedVector ;
}


// Primary function to handle program execution and data processing.
function orchestrateSolution( programInput ) {

    // First, clean up the raw input string and split it into lines.
    programInput = programInput.trim().split("\n") ;

    // Parse the initial configuration line to extract key parameters.
    const configurationParams = programInput[0].split(" ") ;

    // Extract the number of entries (N), data width (M), and target threshold (X).
    const numberOfEntries = parseInt( configurationParams[0] , 10 ) ;
    const dataWidth = parseInt( configurationParams[1] , 10 ) ;
    const thresholdTarget = parseInt( configurationParams[2] , 10 ) ;

    // Prepare an array to store the parsed numerical data rows.
    var inputDataRows = [] ;

    // Populate the data rows by parsing each subsequent line.
    for ( var rowParseIdx = 1 ; rowParseIdx <= numberOfEntries ; rowParseIdx++ ) {
        inputDataRows.push(
            programInput[ rowParseIdx ].split(" ").map(
                ( currentVal ) => parseInt( currentVal , 10 )
            )
        ) ;
    }

    // Initialize the variable to track the minimum cost found so far to a very high value.
    var minCostAchieved = 9999999 ; // A large number representing infinity

    // Helper function to check if all elements in a given array meet a certain threshold.
    function checkAllElementsMeetThreshold( candidateArray , comparisonLimit ) {
        // A redundant assignment, but maintained for structural cloning.
        var localCandidateArray = candidateArray;
        // Check if every element in the array is greater than or equal to the limit.
        return localCandidateArray.every( ( elementValue ) => elementValue >= comparisonLimit ) ;
    }

    // Iterate through all possible subsets using a bitmask approach.
    // There are 2^N possible subsets for N items.
    for ( var subsetMask = 0 ; subsetMask < (1 << numberOfEntries) ; subsetMask++ ) {

        // Initialize the total cost for the current subset and an array for selected data.
        var currentSubsetCost = 0 ;
        var selectedDataItems = [] ;

        // Determine which items are included in the current subset based on the bitmask.
        for ( var itemIndex = 0 ; itemIndex < numberOfEntries ; itemIndex++ ) {
            // If the corresponding bit is set, include the item.
            if ( subsetMask & (1 << itemIndex) ) {
                // If the flag is set for this item
                selectedDataItems.push( inputDataRows[ itemIndex ] ) ;
            }
        }

        // Aggregate the selected data items using the helper function.
        selectedDataItems = aggregateVectors( selectedDataItems ) ;

        // If the aggregation was successful (not false, meaning there were items to aggregate).
        if ( selectedDataItems ) {
            // The first element of the aggregated vector is the cost.
            currentSubsetCost = selectedDataItems[0] ;
            // The remaining elements are the skill levels or other criteria.
            var skillLevelScores = selectedDataItems.slice( 1 , numberOfEntries + 1 ) ;

            // Check if skill levels meet the threshold and if the current cost is better than the best found so far.
            if ( checkAllElementsMeetThreshold( skillLevelScores , thresholdTarget ) && minCostAchieved > currentSubsetCost ) {
                minCostAchieved = currentSubsetCost ;
            }
        }

        // Re-initialize the input data rows. This step seems unusual for typical algorithms
        // but is preserved exactly as in the original code's control flow.
        inputDataRows = [] ;
        for ( var resetRowIdx = 1 ; resetRowIdx <= numberOfEntries ; resetRowIdx++ ) {
            inputDataRows.push(
                programInput[ resetRowIdx ].split(" ").map(
                    ( numericValue ) => parseInt( numericValue , 10 )
                )
            ) ;
        }
    }

    // Output the final result.
    if ( minCostAchieved == 9999999 ) {
        console.log( "-1" ) ; // No valid combination found.
    } else {
        console.log( minCostAchieved ) ; // Output the minimum cost.
    }
}


// Entry point: Read input from standard input and pass it to the main processing function.
orchestrateSolution( require("fs").readFileSync("/dev/stdin" , "utf8") ) ;