const fileSystem = require('fs');

// Reads all standard input data synchronously and processes it into an array of lines.
function acquireAllInputLines() {
    const standardInputFileDescriptor = process.stdin.fd;
    const streamStatistics = fileSystem.fstatSync(standardInputFileDescriptor);
    const totalContentBytes = streamStatistics.size;
    const inputDataBuffer = Buffer.alloc(totalContentBytes);
    const actualBytesRead = fileSystem.readSync(standardInputFileDescriptor, inputDataBuffer, 0, totalContentBytes, 0);
    
    // Convert the buffer to a UTF-8 string and split by newline characters.
    // Filtering out empty lines ensures robustness against trailing newlines.
    return inputDataBuffer.toString('utf8', 0, actualBytesRead).split('\n').filter(line => line.length > 0);
}

// Global storage for all parsed input lines and a cursor for current line access.
const parsedInputContent = acquireAllInputLines();
let currentInputLinePointer = 0;

// Initiates the primary processing sequence for all game scenarios.
beginGameProcessing();

// --- Core Simulation and Pathfinding Logic ---

/**
 * Executes the main game loop, processing multiple grid configurations.
 * Each iteration handles one grid scenario until a termination signal (0 0 dimensions) is received.
 */
function beginGameProcessing() {
    while (true) {
        const currentDimensionLine = parsedInputContent[currentInputLinePointer];
        const dimensionTokens = currentDimensionLine.split(' ');
        const gridDimensionX = Number(dimensionTokens[0]);
        const gridDimensionY = Number(dimensionTokens[1]);

        // If both dimensions are zero, it's the termination signal.
        if (gridDimensionX === 0 && gridDimensionY === 0) {
            break;
        }

        // Advance the input pointer to the next relevant line.
        currentInputLinePointer++;

        // Initializing game state variables for the current grid.
        let initialAgentPosition; // Encoded start point 'S'
        let finalDestinationPosition; // Encoded goal point 'G'
        
        // Stores encoded positions for each of the 5 distinct elemental species.
        // `speciesRegistry[0]` holds locations for species '1', `speciesRegistry[1]` for '2', etc.
        const speciesRegistry = Array.from({ length: 5 }, () => []);
        
        // Iterate through the grid rows to parse map elements.
        // Rows are processed from top (0) to bottom (gridDimensionY - 1).
        for (let rowIterator = 0; rowIterator < gridDimensionY; rowIterator++) {
            const mapRowData = parsedInputContent[currentInputLinePointer + rowIterator];
            // Iterate through columns for the current row.
            for (let colIterator = 0; colIterator < gridDimensionX; colIterator++) {
                const cellCharacter = mapRowData[colIterator];
                
                // Identify and store specific map elements.
                if (cellCharacter === '.') {
                    // Empty space, no action needed.
                } else if (cellCharacter >= '1' && cellCharacter <= '5') {
                    // An elemental species.
                    const speciesIdentifier = Number(cellCharacter);
                    speciesRegistry[speciesIdentifier - 1].push(packCoordinates(colIterator, rowIterator));
                } else if (cellCharacter === 'S') {
                    // The starting point for the agent.
                    initialAgentPosition = packCoordinates(colIterator, rowIterator);
                } else if (cellCharacter === 'G') {
                    // The ultimate goal for the agent.
                    finalDestinationPosition = packCoordinates(colIterator, rowIterator);
                }
            }
        }
        // After parsing the grid, update the input pointer to skip the grid lines.
        currentInputLinePointer += gridDimensionY;

        // --- Dynamic Programming for Shortest Path Calculation ---

        const DISTANCE_LIMIT = 1 << 30; // A large value representing unreachable distances.
        let bestStartingSpeciesChoice = -1; // Index of the species that starts the optimal path sequence.
        let minimalOverallPathLength = DISTANCE_LIMIT; // The shortest path found across all sequences.
        
        // The path must visit 4 distinct species (e.g., S -> Sp1 -> Sp2 -> Sp3 -> Sp4 -> G).
        // Iterate through all 5 possible species to be the *first* in the sequence after 'S'.
        for (let initialSequenceSpecies = 0; initialSequenceSpecies < 5; initialSequenceSpecies++) {
            // `pathDistances[speciesType][instanceIndex]` stores the shortest path from 'S'
            // to a specific instance of a species, considering the current sequence.
            const pathDistances = Array.from({ length: 5 }, () => []);

            // Initialize all path distances to infinity for all species instances.
            for (let sType = 0; sType < 5; sType++) {
                const numSpeciesInstances = speciesRegistry[sType].length;
                pathDistances[sType] = Array(numSpeciesInstances).fill(DISTANCE_LIMIT);
            }
            
            // Determine the actual first species in the cyclical sequence (e.g., if choice is 0, sequence is 0,1,2,3,4).
            const firstSpeciesInCurrentSequence = (initialSequenceSpecies + 1) % 5;
            const instancesOfFirstSpecies = speciesRegistry[firstSpeciesInCurrentSequence];
            const countFirstSpeciesInstances = instancesOfFirstSpecies.length;
            const distancesToFirstSpeciesInstances = pathDistances[firstSpeciesInCurrentSequence];

            // Calculate the initial segment: from 'S' to each instance of the first species.
            for (let i = 0; i < countFirstSpeciesInstances; i++) {
                distancesToFirstSpeciesInstances[i] = computeManhattanDistance(initialAgentPosition, instancesOfFirstSpecies[i]);
            }
                                    
            // This loop calculates the paths through intermediate species.
            // There are 3 intermediate "hops" between species, representing 4 species in total.
            // S -> Sp_A -> Sp_B -> Sp_C -> Sp_D -> G
            // Iteration 0: Sp_A -> Sp_B
            // Iteration 1: Sp_B -> Sp_C
            // Iteration 2: Sp_C -> Sp_D (and then to G)
            let currentPathSpeciesIndex = firstSpeciesInCurrentSequence;
            let currentSpeciesCollection = speciesRegistry[currentPathSpeciesIndex];
            let distancesToCurrentSpeciesCollection = pathDistances[currentPathSpeciesIndex];
            let currentSpeciesCollectionSize = currentSpeciesCollection.length;

            for (let hopNumber = 0; hopNumber < 3; hopNumber++) {
                const nextPathSpeciesIndex = (currentPathSpeciesIndex + 1) % 5;
                const nextSpeciesCollection = speciesRegistry[nextPathSpeciesIndex];
                const distancesToNextSpeciesCollection = pathDistances[nextPathSpeciesIndex];
                const nextSpeciesCollectionSize = nextSpeciesCollection.length;

                for (let i = 0; i < currentSpeciesCollectionSize; i++) {
                    const distanceToCurrentInstance = distancesToCurrentSpeciesCollection[i];
                    const currentInstanceEncodedLocation = currentSpeciesCollection[i];
            
                    // Pruning: If the path to the current instance is already longer than the best path found so far,
                    // there's no need to extend this path further.
                    if (distanceToCurrentInstance >= minimalOverallPathLength) {
                        continue; 
                    }
            
                    for (let j = 0; j < nextSpeciesCollectionSize; j++) {
                        const nextInstanceEncodedLocation = nextSpeciesCollection[j];
                        const segmentLength = computeManhattanDistance(currentInstanceEncodedLocation, nextInstanceEncodedLocation);
                        const candidatePathLength = distanceToCurrentInstance + segmentLength;
                        
                        // Update the shortest known path to this next instance.
                        distancesToNextSpeciesCollection[j] = Math.min(distancesToNextSpeciesCollection[j], candidatePathLength);

                        // If this is the final hop (from Sp_D to G), calculate the total path length.
                        if (hopNumber === 2) {
                            const distanceToGoal = computeManhattanDistance(nextInstanceEncodedLocation, finalDestinationPosition);
                            const finalTotalPathLength = distancesToNextSpeciesCollection[j] + distanceToGoal;
                                            
                            // Update the overall minimal path if a shorter one is found.
                            if (finalTotalPathLength < minimalOverallPathLength) {
                                minimalOverallPathLength = finalTotalPathLength;
                                bestStartingSpeciesChoice = initialSequenceSpecies;
                            }
                        }
                    }
                }
                
                // Move to the next species in the chain for the subsequent hop.
                currentPathSpeciesIndex = nextPathSpeciesIndex;
                currentSpeciesCollection = nextSpeciesCollection;
                distancesToCurrentSpeciesCollection = distancesToNextSpeciesCollection;
                currentSpeciesCollectionSize = nextSpeciesCollectionSize;
            }
        }
        
        // Output the result for the current game scenario.
        if (minimalOverallPathLength === DISTANCE_LIMIT) {
            console.log("NA"); // No valid path found.
        } else {
            // Output the 1-indexed species type and the minimal path length.
            console.log((bestStartingSpeciesChoice + 1) + " " + minimalOverallPathLength);
        }
    }
}

// --- Coordinate Encoding/Decoding and Distance Calculation Utilities ---

/**
 * Packs X and Y coordinates into a single integer for efficient storage and manipulation.
 * X coordinate is stored in higher bits, Y in lower 11 bits (allowing Y up to 2047).
 * @param {number} xCoord - The X coordinate.
 * @param {number} yCoord - The Y coordinate.
 * @returns {number} The packed integer representation of the coordinates.
 */
function packCoordinates(xCoord, yCoord) {
    return (xCoord << 11) | yCoord;
}

/**
 * Extracts the X coordinate from a packed coordinate integer.
 * @param {number} packedPosition - The integer containing packed coordinates.
 * @returns {number} The X coordinate.
 */
function unpackX(packedPosition) {
    return packedPosition >> 11;
}

/**
 * Extracts the Y coordinate from a packed coordinate integer.
 * Uses a bitmask (2047 = 0b11111111111, which is 2^11 - 1) to get the lower 11 bits.
 * @param {number} packedPosition - The integer containing packed coordinates.
 * @returns {number} The Y coordinate.
 */
function unpackY(packedPosition) {
    return packedPosition & 2047;
}

/**
 * Calculates the Manhattan (L1) distance between two points, given their packed integer representations.
 * @param {number} packedPoint1 - The first packed coordinate.
 * @param {number} packedPoint2 - The second packed coordinate.
 * @returns {number} The Manhattan distance.
 */
function computeManhattanDistance(packedPoint1, packedPoint2) {
    const x1 = unpackX(packedPoint1);
    const y1 = unpackY(packedPoint1);
    const x2 = unpackX(packedPoint2);
    const y2 = unpackY(packedPoint2);
    
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}