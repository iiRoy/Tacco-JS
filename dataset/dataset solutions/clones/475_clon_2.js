var ioUtil = require('fs')
   , fileSize = ioUtil.fstatSync(process.stdin.fd).size
   , dataBuf = Buffer.alloc(fileSize)
   , octetsRead = ioUtil.readSync(process.stdin.fd, dataBuf, 0, fileSize, 0)
   , lineData = dataBuf.toString('utf8', 0, octetsRead).split('\n');

executeProcessing(); // Start the main routine.

function executeProcessing() {
    var lineIndex = 0; // Current index for reading input lines

    while (true) {
        let gridDimInfo = lineData[lineIndex].split(' ');
        let gridWidth = parseInt(gridDimInfo[0], 10); // Parse width to integer
        let gridHeight = parseInt(gridDimInfo[1], 10); // Parse height to integer

        // Exit condition: if both dimensions are zero
        if (!gridWidth && !gridHeight) {
            break;
        }

        // Variables for map parsing
        var sourcePoint;
        var targetPoint;
        var creatureInstances = [[], [], [], [], []]; // Stores positions of creatures by type
        var charVal;
        var currentLineContent;
        var creatureTypeCache;
        var rowCoord;
        var colCoord;

        for (rowCoord = gridHeight; rowCoord--;) { // Loop through rows, decrementing from height
            lineIndex++; // Move to the next line of input
            currentLineContent = lineData[lineIndex];
            for (colCoord = gridWidth; colCoord--;) { // Loop through columns, decrementing from width
                charVal = currentLineContent[colCoord];

                if (charVal === '.') {
                    // Empty space, no action needed
                } else if (charVal >= '1' && charVal <= '5') {
                    // Found a creature of type 1-5
                    creatureTypeCache = creatureInstances[parseInt(charVal, 10) - 1];
                    creatureTypeCache.push(encodeCoordinates(colCoord, rowCoord));
                } else if (charVal === 'S') {
                    // Found the starting point
                    sourcePoint = encodeCoordinates(colCoord, rowCoord);
                } else { // Must be 'G'
                    // Found the goal point
                    targetPoint = encodeCoordinates(colCoord, rowCoord);
                }
            }
        }

        // Variables for pathfinding algorithm (dynamic programming)
        const MAX_DIST_VAL = 1073741824; // A large number representing infinity (1 << 30)
        var optimalCreatureType = -1;
        var pathLengthCandidate;
        var shortestPathFound = MAX_DIST_VAL;
        var distanceMatrix; // distanceMatrix[creatureType][instanceIndex]
        var idx1; // Generic loop index
        var idx2; // Another generic loop index
        var stepIdx; // Index for path segments (S->C1, C1->C2, ..., C4->G)
        var currentLength;
        var currentDistRow; // Reference to a row in distanceMatrix
        var currentDistEntry; // Reference to an entry in currentDistRow
        var nextDistRow; // Reference to the next row in distanceMatrix
        var currentCreatureRow; // Reference to a row in creatureInstances
        var currentCreatureEntry; // Reference to an entry in currentCreatureRow
        var nextCreatureRow; // Reference to the next row in creatureInstances
        var currentCreatureType;
        var currentCreatureCount;
        var nextCreatureType;
        var nextCreatureCount;

        // Iterate through each possible starting creature type for the path S -> C1 -> C2 -> C3 -> C4 -> G
        for (var initialCreatureSelection = 0; initialCreatureSelection < 5; initialCreatureSelection++) {
            distanceMatrix = [[], [], [], [], []]; // Reset distance matrix for each new starting type

            for (idx1 = 5; idx1--;) { // Initialize all distances within the matrix to MAX_DIST_VAL
                currentLength = creatureInstances[idx1].length;
                distanceMatrix[idx1].length = currentLength;
                let distRowRef = distanceMatrix[idx1];
                while (currentLength--) {
                    distRowRef[currentLength] = MAX_DIST_VAL;
                }
            }

            currentCreatureType = (initialCreatureSelection + 1) % 5; // Determine the first creature type in the sequence
            currentCreatureCount = creatureInstances[currentCreatureType].length;
            currentDistRow = distanceMatrix[currentCreatureType];
            currentCreatureRow = creatureInstances[currentCreatureType];

            for (idx1 = 0; idx1 < currentCreatureCount; idx1++) {
                // Calculate initial distances from the source 'S' to all instances of the first creature type
                currentDistRow[idx1] = calculateManhattanDistance(sourcePoint, currentCreatureRow[idx1]);
            }

            // Loop for the three intermediate steps: C_x -> C_(x+1)
            for (stepIdx = 0; stepIdx < 3; stepIdx++) {
                nextCreatureType = (currentCreatureType + 1) % 5;
                nextDistRow = distanceMatrix[nextCreatureType];
                nextCreatureRow = creatureInstances[nextCreatureType];
                nextCreatureCount = nextCreatureRow.length;

                for (idx1 = 0; idx1 < currentCreatureCount; idx1++) {
                    currentDistEntry = currentDistRow[idx1];
                    currentCreatureEntry = currentCreatureRow[idx1];

                    // Prune paths that are already longer than the shortest found global path
                    if (currentDistEntry >= shortestPathFound) {
                        continue;
                    }

                    for (idx2 = 0; idx2 < nextCreatureCount; idx2++) {
                        let nextCreatureEntry = nextCreatureRow[idx2];
                        let nextDistEntry = nextDistRow[idx2];
                        let calculatedNewDist = currentDistEntry + calculateManhattanDistance(currentCreatureEntry, nextCreatureEntry);
                        
                        nextDistRow[idx2] = findMinimum(nextDistEntry, calculatedNewDist); // Update minimum distance to next creature instance

                        if (stepIdx === 2) { // This is the final creature-to-creature transition (C4)
                            pathLengthCandidate = nextDistRow[idx2] + calculateManhattanDistance(nextCreatureEntry, targetPoint);

                            if (pathLengthCandidate < shortestPathFound) {
                                shortestPathFound = pathLengthCandidate;
                                optimalCreatureType = initialCreatureSelection;
                            }
                        }
                    }
                }

                // Prepare for the next iteration of the step loop
                currentCreatureType = nextCreatureType;
                currentDistRow = nextDistRow;
                currentCreatureRow = nextCreatureRow;
                currentCreatureCount = nextCreatureCount;
            }
        }

        if (shortestPathFound === MAX_DIST_VAL) {
            console.log("NA"); // No path could be found
        } else {
            console.log((optimalCreatureType + 1) + " " + shortestPathFound); // Output the best creature type index and the shortest distance
        }
                   
        lineIndex++; // Advance the input line pointer past the current grid's data
    }
     
}
                   
/* Computes the Manhattan (L1) distance between two encoded points */
function calculateManhattanDistance(pointOne, pointTwo){
    // X coordinate is stored in higher bits (right-shifted by 11)
    // Y coordinate is stored in lower 10 bits (ANDed with 2047, which is 0b1111111111)
    return absoluteValue((pointOne >> 11) - (pointTwo >> 11)) + absoluteValue((pointOne & 2047) - (pointTwo & 2047));
}
                   
/* Returns the minimum of two integer values using bitwise operations for performance */
function findMinimum(valA, valB){
    // This bitwise trick can be faster than a conditional (e.g., Math.min)
    return valB + ((valA - valB) & ((valA - valB) >> 31));
}
                   
/* Encodes 2D coordinates (x, y) into a single integer for compact storage */
function encodeCoordinates(xCoord, yCoord){
    // X coordinate is shifted left by 11 bits; Y coordinate takes the lower 11 bits.
    // This assumes Y coordinates are within 0-2047 and X coordinates fit in remaining bits.
    return (xCoord << 11) + yCoord;
}
                  
/* Calculates the absolute value of an integer using bitwise operations */
function absoluteValue(numVal){
    // Bitwise trick for absolute value: (x ^ (x >> 31)) - (x >> 31)
    // For positive x, x >> 31 is 0, so (x ^ 0) - 0 = x
    // For negative x, x >> 31 is -1 (all ones), so (x ^ -1) - (-1) = ~x + 1 = |x|
    var mask = numVal >> 31;
    return (numVal ^ mask) - mask;
}