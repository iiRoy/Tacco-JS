function ProcessInput(rawData)
{
    // Pre-process the raw text data: trim, split into lines, then split each line by space
    let  processedLines = rawData.trim().split("\n") .map(function(lineData) { return lineData.split(" "); } );

    // Parse the board dimensions and number of moves from the first line
    let  boardSize = parseInt( processedLines[0][0] , 10);
    let  numMoves = parseInt( processedLines[0][1] , 10);

    // Parse the next position mapping for each node
    let  nextPositions = processedLines[1].map( element => parseInt(element, 10));

    // Parse the points associated with each node
    let  pointValues = processedLines[2].map( element => parseInt(element, 10));

    // Initialize an array to track visited nodes during cycle detection
    let  visitedNodes = Array.from( {length: boardSize} , ( ) => false );

    // This array will store all detected cycles, each cycle being an array of [node_id, point_value] pairs
    let  allCycles = [ ] ;

    // Initialize the maximum overall score to negative infinity
    let  maxOverallScore = -1 * Infinity;

    // Declare auxiliary variables for cycle traversal and score calculation
    let cycleStart, currentNode, nextNode, currentPathScore, cycleTotalScore;

    // Iterate through each possible starting node to find and process cycles
    for (let nodeIdx = 0; nodeIdx < boardSize; nodeIdx++)
    {
        // Only process nodes that haven't been visited yet (i.e., part of a new cycle)
        if ( ! visitedNodes[nodeIdx] )
        {
            // Start a new cycle entry with the current node's data
            allCycles.push( [ [nodeIdx + 1, pointValues[nodeIdx]] ] );
            cycleTotalScore = pointValues[nodeIdx];
            cycleStart = nodeIdx + 1;
            currentNode = nodeIdx + 1;

            // Traverse the cycle until the starting node is reached again
            while(true)
            {
                // Mark the current node as visited
                visitedNodes[currentNode - 1] = true;
                nextNode = nextPositions[currentNode - 1]; // Get the next node in the sequence

                // If we've returned to the cycle's starting point, break the loop
                if (cycleStart === nextNode) {
                    break;
                }

                // Move to the next node and accumulate its points to the cycle's total
                currentNode = nextNode;
                cycleTotalScore += pointValues[currentNode - 1];
                allCycles[allCycles.length - 1].push([currentNode, pointValues[currentNode - 1]]); // Add node to current cycle
            }

            // Create a copy of the current cycle's nodes for processing
            let currentCycleNodes = allCycles[allCycles.length - 1].slice();
            let maxRemainingPathScore = -1 * Infinity; // Max score for a path segment within the cycle

            // Determine the effective path length for calculating scores
            let effectivePathLength;
            if (numMoves <= currentCycleNodes.length) {
                effectivePathLength = numMoves; // If moves are less than or equal to cycle length, use moves
            } else if (cycleTotalScore > 0) {
                // If cycle has positive total score, consider full cycles and remaining path
                effectivePathLength = numMoves % currentCycleNodes.length;
                if (effectivePathLength === 0) {
                    effectivePathLength = currentCycleNodes.length; // If remainder is 0, use full cycle
                }
            } else {
                // If cycle has non-positive total score, only consider paths up to one full cycle
                effectivePathLength = currentCycleNodes.length;
            }

            // Iterate through all possible starting points within the current cycle
            for (let startOffset = 0; startOffset < currentCycleNodes.length; startOffset++)
            {
                currentPathScore = 0; // Reset path score for each starting point
                // Calculate the score for a path of 'effectivePathLength' steps
                for (let pathStep = startOffset; pathStep < startOffset + effectivePathLength; pathStep++)
                {
                    let wrappedStep = pathStep % currentCycleNodes.length; // Handle wrapping around the cycle
                    currentPathScore += currentCycleNodes[wrappedStep][1]; // Add points of the current node in path
                    maxRemainingPathScore = Math.max(maxRemainingPathScore, currentPathScore); // Update max path score
                }
            }

            // Update the overall maximum score
            // This considers the max path score found, plus full cycle contributions if any
            maxOverallScore = Math.max(maxOverallScore, maxRemainingPathScore + Math.max(0, cycleTotalScore) * Math.floor((numMoves - effectivePathLength) / currentCycleNodes.length));
        }
    }

    // Output the final maximum score
    console.log(maxOverallScore);
}


// Read input from standard input and pass it to the main processing function
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );