var dataStream = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Obtain raw input from standard input

// Process the raw input into an array of lines, removing leading/trailing whitespace
let lineFragments = (dataStream.trim()).split("\n");

// Main processing loop, continues until a termination condition is met
while (true)
{
    // Extract the first line of the current input block and parse it into two numbers
    // These numbers typically represent dimensions or counts (e.g., N M)
    const dimensions = lineFragments.shift().split(" ").map(Number);

    // Check for the termination condition: both dimensions are zero
    if ( dimensions[0] === 0 && dimensions[1] === 0 )
    {
        break; // Exit the processing loop
    }

    // Initialize an array to track scores for each item
    // Each element is an array: [item_identifier, accumulated_score]
    let scoreTracker = [ ] ;
    for ( let idx = 0 ; idx < dimensions[1] ; idx++ )
    {
        scoreTracker[idx] = [ idx + 1 , 0 ] ; // Assign initial identifier and zero score
    }

    // Process subsequent lines, each representing a set of values to add to scores
    for ( let rowIdx = 0 ; rowIdx < dimensions[0] ; rowIdx++ )
    {
        // Parse the current line into an array of numeric values
        const currentValues = lineFragments.shift().split(" ").map(Number);

        // Iterate through the current values and accumulate them into the score tracker
        currentValues.forEach( function( currentScore , itemIndex )
        {
            scoreTracker[itemIndex][1] += currentScore; // Add the value to the corresponding item's score
        } ) ;
    }

    // Sort the score tracker array based on specific criteria:
    // Primary sort: descending by accumulated score
    // Secondary sort (tie-breaker): ascending by item identifier
    scoreTracker.sort( function( itemA , itemB )
    {
        if ( itemA[1] === itemB[1] )
        {
            return itemA[0] - itemB[0] ; // Sort by identifier if scores are equal
        }
        else
        {
            return itemB[1] - itemA[1] ; // Sort by score in descending order
        }
    } ) ;

    // Prepare an array to store the final ordered identifiers
    let finalOrder = [] ;
    scoreTracker.forEach( function( _val , pos )
    {
        finalOrder.push( scoreTracker[pos][0] ) ; // Extract only the identifier
    } ) ;

    // Output the final ordered identifiers, joined by spaces
    console.log( finalOrder.join(" ") ) ;
}