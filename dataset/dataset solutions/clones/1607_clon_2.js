const fileSystem = require ( "fs" )
const rawData = fileSystem.readFileSync ( "/dev/stdin" , "utf8" ) ;
const textLines = rawData.split ( '\n' ) ;

let [ graphSize , stepLimit ] = textLines[0].split ( ' ' ).map ( parseInt ) ;
const nextNodes = textLines[1].split ( ' ' ).map ( parseInt ) ;
const nodeScores = textLines[2].split ( ' ' ).map ( parseInt ) ;
// Prepend null to make indices 1-based, matching problem statement
nextNodes.unshift ( null ) ;
nodeScores.unshift ( null ) ;

/**
 * Calculates the maximum possible score starting from a given node within a step limit.
 * @param {number} initialNode - The starting node index.
 * @returns {number} The highest score attainable.
 */
const calculateMaxScore = ( initialNode ) => {
    // Tracks visited nodes in the current path to detect cycles
    const pathTracker = { } ;
    let currentNode = initialNode ;
    let accumulatedValue = 0 ;
    let highestValue = -999999999 ; // Initialize with a very small number
    let cycleDetected = false ;
    let iteration = 0 ; // Counter for steps taken in the first pass

    // First pass: traverse the path until stepLimit is reached or a cycle is detected
    for ( iteration ; iteration < stepLimit ; iteration++ ) {
        pathTracker [ currentNode ] = true ; // Mark current node as visited
        currentNode = nextNodes [ currentNode ] ; // Move to the next node
        accumulatedValue += nodeScores [ currentNode ] ; // Add score of the new node
        highestValue = Math.max ( highestValue , accumulatedValue ) ; // Update max score encountered
        
        // Check if the next node has already been visited in this path, indicating a cycle
        if ( pathTracker [ currentNode ] ) {
            cycleDetected = true ;
            break ; // Exit loop if a cycle is found
        }
    }

    // If no cycle was detected, or the step limit was reached before a cycle,
    // the highestValue from the direct path is the answer.
    if ( !cycleDetected ) {
        return highestValue ;
    }

    // If a cycle was detected but the sum of scores within the cycle is negative,
    // it's always better to not repeat the cycle, so the peak before the cycle is the answer.
    if ( accumulatedValue < 0 ) {
        return highestValue ;
    }

    // Calculate how many full cycles can be completed within the remaining steps
    // 'iteration' at this point is the length of the cycle path (k+1 from original)
    const fullCycles = stepLimit % ( iteration + 1 ) ? Math.floor ( stepLimit / ( iteration + 1 ) ) : stepLimit / ( iteration + 1 ) - 1 ;

    // Reset current node and prepare for calculating remainder steps
    currentNode = initialNode ;
    let partialValue = 0 ;
    let partialHighest = -999999999 ; // Initialize for remainder steps
    let remainingIterations = stepLimit % ( iteration + 1 ) ; // Steps remaining after full cycles
    iteration = 0 ; // Reset iteration counter for the remainder part

    // Second pass: calculate scores for the remaining steps (partial cycle)
    for ( iteration ; iteration < remainingIterations ; iteration++ ) {
        currentNode = nextNodes [ currentNode ] ; // Move to the next node
        partialValue += nodeScores [ currentNode ] ; // Add score
        partialHighest = Math.max ( partialHighest , partialValue ) ; // Update max for partial
    }
    
    // The final result is the maximum of two scenarios:
    // 1. (fullCycles - 1) complete cycles + the highest value achieved within the *first* cycle
    // 2. (fullCycles) complete cycles + the highest value achieved within the *partial* cycle
    return Math.max ( accumulatedValue * ( fullCycles - 1 ) + highestValue , accumulatedValue * fullCycles + partialHighest ) ;
} ; // End of calculateMaxScore function

let overallMax = -999999999 ; // Initialize overall maximum score
// Iterate through each possible starting node from 1 to graphSize
for ( let beginIndex = 1 ; beginIndex <= graphSize ; beginIndex++ ) {
    overallMax = Math.max ( overallMax , calculateMaxScore ( beginIndex ) ) ; // Update overall max
}

// Display the final computed maximum score
console.log ( overallMax ) ;