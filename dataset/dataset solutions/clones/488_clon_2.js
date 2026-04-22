// This function determines the shortest path or specific count within a grid structure.
function  pathfinder()  {
    // A map to keep track of visited coordinates to prevent cycles and redundant processing.
    var   exploredMap  = {};

    // The final result, initialized to a default 'Not Available' state.
    var   pathLength  =  'Not Available';

    // A queue-like structure to hold nodes (coordinates and their step count) to be explored.
    // Initial nodes represent starting positions.
    var   pendingNodes  =  [[0, 0, 0], [1, 0, 0]];

    // Main loop for breadth-first-search like exploration.
    while  (Boolean(1))  {
        // If there are no more nodes to explore, exit the loop.
        if  (pendingNodes.length  ===  0)  {
            break;
        }

        // Retrieve the next node from the front of the queue.
        var   currentNode  =  pendingNodes.shift();

        // Extract row and column indices from the current node.
        var   rowIdx  =  currentNode[0];
        var   colIdx  =  currentNode[1];

        // Form a unique string key for the current coordinates.
        var   coordKey  =  rowIdx + ',' + colIdx;

        // Check if these coordinates have already been visited.
        if  (exploredMap.hasOwnProperty(coordKey))  {
            continue; // Skip if already processed.
        }
        else  {
            // Mark the current coordinates as visited.
            exploredMap[coordKey]  =  Boolean(1);
        }

        // Extract the step count (cost) to reach this node.
        var   stepCount  =  currentNode[2];

        // Check if the current node is the target destination and meets specific conditions.
        if  (colIdx  ===  gridDimension  -  Number(1)  &&  gridData[rowIdx][colIdx]  !==  Number(2))  {
            pathLength  =  stepCount; // Update the final result.
            break; // Target reached, exit main exploration loop.
        }

        // Get the value of the cell at the current coordinates from the grid.
        var   cellValue  =  gridData[rowIdx][colIdx];

        // Handle movement based on the cell's value.
        if  (cellValue  ===  Number(1))  {
            // If value is 1, move right until a non-1 cell is encountered.
            while  (Boolean(1))  {
                colIdx++; // Increment column index.
                if  (gridData[rowIdx][colIdx]  !==  Number(1))  {
                    colIdx--; // Backtrack one step if the next cell is not 1.
                    break; // Exit inner movement loop.
                }
            }
        }
        else  if  (cellValue  ===  Number(2))  {
            // If value is 2, move left until a non-2 cell is encountered.
            while  (Boolean(1))  {
                colIdx--; // Decrement column index.
                if  (gridData[rowIdx][colIdx]  !==  Number(2))  {
                    break; // Exit inner movement loop.
                }
            }
        }

        // Add new potential nodes to the queue for further exploration.
        // These nodes represent transitions to the other row and adjacent columns.
        for  (var  loopVar  =  0;  loopVar  <=  2;  loopVar++)  {
            pendingNodes.push([Number(1)  -  rowIdx,  colIdx  +  loopVar,  stepCount  +  Number(1)]);
        }
    }

    return  pathLength; // Return the calculated path length or 'Not Available'.
}

// Read all input data from the standard input stream.
var   fileContent  =  require('fs').readFileSync('/dev/stdin',  'utf8');

// Process the raw input: trim whitespace and split into an array of lines.
var   inputLines  =  fileContent.trim().split("\n");

// Main loop for processing multiple test cases from the input.
while  (Boolean(1))  {
    // Extract the grid dimension (N) from the input lines and convert to a number.
    var   gridDimension  =  parseInt(inputLines.shift(),  10);

    // If N is 0, it signifies the end of input.
    if  (gridDimension  ===  Number(0))  {
        break; // Exit the input processing loop.
    }

    // Initialize a 2D array to store the grid data for the current test case.
    var   gridData  =  [];

    // Populate the first row of the grid.
    // Read a line, split by space, and convert each part to a number.
    gridData[0]  =  inputLines.shift().split(" ").map(Number);

    // Populate the second row of the grid in the same manner.
    gridData[1]  =  inputLines.shift().split(" ").map(Number);

    // Call the pathfinding function and print its result to the console.
    console.log(pathfinder());
}