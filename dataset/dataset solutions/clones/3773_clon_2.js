// This function determines if two simple objects have identical properties and values.
function compareObjects (  firstObject ,  secondObject  )
{
    let firstKeys = Object.getOwnPropertyNames( firstObject ) ;
    let secondKeys = Object.getOwnPropertyNames( secondObject ) ;
    // If the number of properties differs, they cannot be equal.
    if  ( firstKeys.length !== secondKeys.length )
    {
        return false ;
    }
    for ( let idx = 0  ; idx < firstKeys.length ; idx++  )
    {
        // Compare the values of each property.
        if ( firstObject[ firstKeys[idx] ]  !== secondObject[ firstKeys[idx] ] )
        {
            return false ;
        }
    }
    // All checks passed, objects are considered equal.
    return  true ;
}

// Utility function to convert a string to an integer with base 10.
function parseDecimalInteger (  inputString  )
{
    return parseInt( inputString ,  10  ) ;
}

// Pre-calculated powers of 6, used in some recursive calculation.
const powersOfSix = [ 6, 5, 4, 3, 2, 1 ].map (  ( exponent ) => Math.pow( 6, exponent )  ) ;
// Pre-calculated powers of 9, similarly used for recursive steps.
const powersOfNine = [ 5, 4, 3, 2, 1 ].map (  ( exponent ) => Math.pow( 9, exponent )  ) ;

/*
 * This recursive function computes the minimum steps required
 * to reach a target value using specific power subtractions.
 */
function calculateMinimumSteps (  currentValue  )
{
    // Base case 1: If currentValue is less than 6, return currentValue itself.
    if ( currentValue < 6 )
    {
        return currentValue ;
    }
    // Base case 2: If currentValue is between 6 and 9 (exclusive of 9).
    if ( currentValue < 9 )
    {
        return 1 + ( currentValue - 6 ) ;
    }
    // Recursive step: Try subtracting the largest applicable power of 6 or 9.
    return Math.min(
        calculateMinimumSteps( currentValue - powersOfSix.find( ( powerVal ) => powerVal <= currentValue ) ) + 1 ,
        calculateMinimumSteps( currentValue - powersOfNine.find( ( powerVal ) => powerVal <= currentValue ) ) + 1
    ) ;
}

/*
 * This is the primary function that processes input data
 * to calculate the minimum cost based on color transformations.
 */
function processInputData ( rawDataString )
{
    // Split the input string into individual lines.
    let inputLines = rawDataString.split( "\n" ) ;

    // Parse the grid dimension (N) and the number of available colors (C) from the first line.
    const [ gridDimension , availableColors ] = inputLines.shift().split( " " ).map( ( lineData ) => parseDecimalInteger( lineData ) ) ;

    // Extract the color cost matrix (D) from the subsequent lines.
    const colorCostMatrix = inputLines.splice( 0 , availableColors ).map( ( lineData ) =>
        lineData.split( " " ).map( ( cellValue ) => parseDecimalInteger( cellValue ) )
    ) ;

    // Extract the initial grid colors (c) for the N x N grid.
    const initialGridColors = inputLines.splice( 0 , gridDimension ).map( ( lineData ) =>
        lineData.split( " " ).map( ( cellValue ) => parseDecimalInteger( cellValue ) )
    ) ;

    // Initialize an array to store color counts based on (row + column) % 3.
    // Each sub-array represents a remainder group (0, 1, or 2) and contains counts for each color.
    const remainderGroupColorCounts = [
        new Array( availableColors ).fill(0) ,
        new Array( availableColors ).fill(0) ,
        new Array( availableColors ).fill(0)
    ] ;

    // Iterate through the grid to populate the remainderGroupColorCounts.
    initialGridColors.forEach( ( rowColors , rowIdx ) => {
        rowColors.forEach( ( colorIdx , colIdx ) => {
            // Increment the count for the specific color in its corresponding remainder group.
            remainderGroupColorCounts[ ( rowIdx + colIdx ) % 3 ][ colorIdx - 1 ]++ ;
        } ) ;
    } ) ;

    // Calculate the total transformation cost for each color in each remainder group.
    const remainderGroupCalculatedCosts = remainderGroupColorCounts.map( ( colorStats ) => {
        // Debugging output for intermediate calculations.
        console.log( new Array( availableColors ).fill(null).map( ( _ , destinationColor ) =>
            colorStats.map( ( occurrenceCount , originalColor ) =>
                originalColor === destinationColor ? 0 : occurrenceCount * colorCostMatrix[ originalColor ][ destinationColor ]
            )
        ) ) ;
        // Return an array where each element is the total cost if a remainder group is changed to that specific color.
        return new Array( availableColors ).fill(null).map( ( _ , destinationColor ) =>
            colorStats.map( ( occurrenceCount , originalColor ) =>
                originalColor === destinationColor ? 0 : occurrenceCount * colorCostMatrix[ originalColor ][ destinationColor ]
            ).reduce( ( accumulator , currentValue ) => accumulator + currentValue , 0 )
        ) ;
    } ) ;

    // Initialize the variable to store the absolute minimum total cost found.
    let absoluteMinimumCost = Infinity ;

    // Iterate through all possible combinations of target colors for the three remainder groups.
    for ( let firstChoice = 0 ; firstChoice < availableColors ; firstChoice++ )
    {
        for ( let secondChoice = 0 ; secondChoice < availableColors ; secondChoice++ )
        {
            // Ensure the second choice color is different from the first choice color.
            if ( firstChoice === secondChoice )
            {
                continue ;
            }
            for ( let thirdChoice = 0 ; thirdChoice < availableColors ; thirdChoice++ )
            {
                // Ensure the third choice color is different from both the first and second choices.
                if ( secondChoice === thirdChoice || firstChoice === thirdChoice )
                {
                    continue ;
                }

                // Calculate the current total cost for this combination.
                const currentTotalCombinationCost = remainderGroupCalculatedCosts[ 0 ][ firstChoice ] +
                                                    remainderGroupCalculatedCosts[ 1 ][ secondChoice ] +
                                                    remainderGroupCalculatedCosts[ 2 ][ thirdChoice ] ;

                // Optionally log combinations that don't improve the minimum score (for debugging).
                if ( absoluteMinimumCost <= currentTotalCombinationCost )
                {
                    console.log( firstChoice , secondChoice , thirdChoice ) ;
                }

                // Update the absolute minimum cost if the current combination is cheaper.
                absoluteMinimumCost = Math.min( absoluteMinimumCost , currentTotalCombinationCost ) ;
            }
        }
    }

    // Output all relevant variables for final inspection.
    console.log( rawDataString , remainderGroupColorCounts , remainderGroupCalculatedCosts , absoluteMinimumCost ) ;
}

// Read input from standard input and pass it to the main processing function.
processInputData( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;