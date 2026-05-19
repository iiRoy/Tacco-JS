let inputLines = []; // This array will store all lines read from standard input.

// Import the 'readline' module for handling input operations.
const inputReader = require('readline');

// Create an interface for reading input line by line from the standard input stream.
const interfaceInstance = inputReader.createInterface({
    input: process.stdin,   // Specifies the input source as standard input.
    output: process.stdout, // Specifies the output destination as standard output (though not used for writing in this specific setup).
});

// Attach an event listener to process each line of input as it is received.
interfaceInstance.on('line', function (currentLine) {
    inputLines.push(currentLine); // Add the current line to our collection of input lines.
});

// Attach an event listener to execute a block of code once the input stream has closed.
interfaceInstance.on('close', function () {
    // Parse the first line of input to get the main modulus value for calculations.
    const modulusValue = Number(inputLines[0]);

    // Initialize a 2D array (matrix) to store distances between nodes.
    // All distances are initially set to Infinity, representing unreachable paths.
    let distanceMatrix = Array(modulusValue).fill(Infinity).map(
        (rowPlaceholder) => {
            // For each row, create a new array of 'modulusValue' length, also filled with Infinity.
            return Array(modulusValue).fill(Infinity);
        }
    );

    // Populate the initial direct edge weights based on the problem's rules.
    // These represent the immediate costs of specific transitions between nodes.
    for (let nodeIndex = 0; nodeIndex < modulusValue; nodeIndex++) {
        // Set the cost from 'nodeIndex' to '(nodeIndex + 1) % modulusValue' as 1.
        distanceMatrix[nodeIndex][(nodeIndex + 1) % modulusValue] = 1;
        // Set the cost from 'nodeIndex' to '(nodeIndex * 10) % modulusValue' as 0.
        distanceMatrix[nodeIndex][(nodeIndex * 10) % modulusValue] = 0;
        // The cost of moving from a node to itself is always 0.
        distanceMatrix[nodeIndex][nodeIndex] = 0;
    }

    // Define the specific starting and ending nodes for which we want to find the shortest path.
    const initialNode = 1;
    const targetNode = 0;

    // Apply the Floyd-Warshall algorithm to compute all-pairs shortest paths.
    // This algorithm iterates through all possible intermediate nodes to find shorter paths.
    for (let intermediateNode = 0; intermediateNode < modulusValue; intermediateNode++) {
        for (let sourceNode = 0; sourceNode < modulusValue; sourceNode++) {
            for (let destinationNode = 0; destinationNode < modulusValue; destinationNode++) {
                // Update the shortest path from 'sourceNode' to 'destinationNode'
                // if a path through 'intermediateNode' is shorter than the current known path.
                distanceMatrix[sourceNode][destinationNode] = Math.min(
                    distanceMatrix[sourceNode][destinationNode],
                    distanceMatrix[sourceNode][intermediateNode] + distanceMatrix[intermediateNode][destinationNode]
                );
            }
        }
    }

    // Output the calculated shortest distance from 'initialNode' to 'targetNode',
    // adding 1 to the result as per the problem's specific requirement.
    console.log(distanceMatrix[initialNode][targetNode] + 1);
});
