'use strict';

function graphProcessor(incomingData) {
    // Input parsing: Use parseInt instead of Number and avoid array destructuring helpers
    const parameterStrings = incomingData[0].split(' ');
    const nodeCount = parseInt(parameterStrings[0], 10);
    const targetKValue = parseInt(parameterStrings[1], 10);

    let matchFound = false;
    let determinedPathLength = 0; // Renamed 'M' from original

    // Search for 'determinedPathLength' (original 'M') from nodeCount down to 1
    // This loop logic is kept similar for functional equivalence, but variable names are new.
    for (let searchIterator = nodeCount; searchIterator >= 1; searchIterator--) {
        const tempSegmentLength = nodeCount - searchIterator + 1; // Renamed 'L' from original
        // The core formula for K, derived from problem's specific construction
        const calculatedKForCurrentPath = (tempSegmentLength - 1) * (tempSegmentLength - 2) / 2 + searchIterator - 1;

        if (calculatedKForCurrentPath === targetKValue) {
            matchFound = true;
            determinedPathLength = searchIterator; // Store the found value
            break;
        }
    }

    if (!matchFound) {
        console.log(-1);
    } else {
        console.log(nodeCount - 1); // Total number of edges in a tree

        // Generate the first set of edges (a path starting from node 1)
        // Using a recursive function instead of an imperative for loop
        function recursivelyCreatePathEdges(currentEdgeStartNode, pathEndPoint) {
            if (currentEdgeStartNode > pathEndPoint) {
                return; // Base case: path completed
            }
            console.log(`${currentEdgeStartNode} ${currentEdgeStartNode + 1}`);
            recursivelyCreatePathEdges(currentEdgeStartNode + 1, pathEndPoint);
        }

        recursivelyCreatePathEdges(1, determinedPathLength);

        // Generate the second set of edges (a star graph centered at determinedPathLength + 1)
        // Using another recursive function for a different approach
        function recursivelyCreateStarEdges(starCenterNode, currentLeafNode, maxLeafNode) {
            if (currentLeafNode > maxLeafNode) {
                return; // Base case: all leaf nodes connected
            }
            console.log(`${starCenterNode} ${currentLeafNode}`);
            recursivelyCreateStarEdges(starCenterNode, currentLeafNode + 1, maxLeafNode);
        }

        const centralNodeForStar = determinedPathLength + 1;
        recursivelyCreateStarEdges(centralNodeForStar, determinedPathLength + 2, nodeCount);
    }
}

// Standard input/output handling, using different function names and structure
function initiateStandardIO() {
    let accumulatedInput = "";
    process.stdin.setEncoding("utf8"); // Ensure correct encoding

    // Event listener for data chunks
    process.stdin.on("data", function (inputChunk) {
        accumulatedInput += inputChunk;
    });

    // Event listener for end of input
    process.stdin.on("end", function () {
        // Split input by newlines and pass to the main processing function
        graphProcessor(accumulatedInput.split("\n"));
    });
}

// Start the input processing
initiateStandardIO();