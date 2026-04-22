// This function processes grid input to find specific patterns and segment areas.
function ProcessGrid(rawData) {
    // Standard input parsing: trim, split by newline, then split each line by space.
    rawData = rawData.trim().split("\n").map(function (lineStr) { return lineStr.split(" "); });

    // Extract grid dimensions.
    var gridRows = parseInt(rawData[0][0], 10); // Number of rows in the grid.
    var gridCols = parseInt(rawData[0][1], 10); // Number of columns in the grid.

    // Initialize data structures for grid processing.
    var gridDataArray = []; // Stores the actual grid characters.
    var patternMatchGrid = []; // Marks cells that match the checkerboard pattern.
    var segmentIdMap = []; // Stores the segment ID for each cell.

    // Populate initial data structures based on input dimensions.
    for (var r = 0; r < gridRows; r++) {
        gridDataArray.push(rawData[r + 1]); // Add grid row data.
        patternMatchGrid.push(Array.from({ length: gridCols }, () => 0)); // Initialize match grid with zeros.
        segmentIdMap.push(Array.from({ length: gridCols }, () => -1)); // Initialize segment map with -1 (unassigned).
    }

    // Determine if each cell matches a checkerboard pattern.
    var expectedChar = ''; // Character expected for the current cell position.
    for (var r = 0; r < gridRows; r++) {
        for (var c = 0; c < gridCols; c++) {
            // Checkerboard pattern: (row + col) is even -> '#', odd -> '.'
            if ((r + c) % 2 === 0) {
                expectedChar = '#';
            } else {
                expectedChar = '.';
            }
            // Check if the cell's character matches the expected pattern.
            if (gridDataArray[r][0].substr(c, 1) === expectedChar) {
                patternMatchGrid[r][c] = 1; // Mark as matching.
            }
        }
    }

    // Variables for segment (island) processing.
    var currentSegmentIdentifier = 0; // Unique ID for newly found segments.
    var neighboringSegmentIDs = []; // Stores IDs of adjacent segments.
    var segmentColorCounts = []; // Stores counts of 'black' and 'white' cells for each segment.
    var segmentCellPositions = []; // Stores coordinates of cells belonging to each segment.
    var cellsToReassign; // Temporary list for cells whose segment ID needs updating during merges.

    // Iterate through each cell to identify and merge segments.
    for (var r = 0; r < gridRows; r++) {
        for (var c = 0; c < gridCols; c++) {
            // Reset adjacent segment IDs for the current cell.
            neighboringSegmentIDs = [];

            // Check top neighbor.
            if ((r - 1) >= 0) {
                // If top neighbor has same pattern match status, add its segment ID.
                if (patternMatchGrid[r - 1][c] === patternMatchGrid[r][c]) {
                    neighboringSegmentIDs.push(segmentIdMap[r - 1][c]);
                }
            }
            // Check left neighbor.
            if ((c - 1) >= 0) {
                // If left neighbor has same pattern match status, add its segment ID.
                if (patternMatchGrid[r][c - 1] === patternMatchGrid[r][c]) {
                    neighboringSegmentIDs.push(segmentIdMap[r][c - 1]);
                }
            }

            // Handle different adjacency scenarios:
            if (neighboringSegmentIDs.length > 1) {
                // More than one adjacent segment: potential merge.
                if (neighboringSegmentIDs[0] !== neighboringSegmentIDs[1]) {
                    // If adjacent segments are different, merge them.
                    var largerId = Math.max(neighboringSegmentIDs[0], neighboringSegmentIDs[1]);
                    var smallerId = Math.min(neighboringSegmentIDs[0], neighboringSegmentIDs[1]);

                    cellsToReassign = segmentCellPositions[largerId];
                    // Reassign cells from the larger ID segment to the smaller ID segment.
                    for (var k = 0; k < cellsToReassign.length; k++) {
                        segmentIdMap[cellsToReassign[k][0]][cellsToReassign[k][1]] = smallerId;
                        segmentCellPositions[smallerId].push([cellsToReassign[k][0], cellsToReassign[k][1]]);
                    }
                    // Update color counts by combining the two segments.
                    segmentColorCounts[smallerId] = VectorOperation(segmentColorCounts[smallerId], segmentColorCounts[largerId], '+');
                    segmentColorCounts[largerId] = null; // Mark the merged segment as defunct.
                }
                // Assign the current cell to the (merged) segment.
                segmentIdMap[r][c] = Math.min(neighboringSegmentIDs[0], neighboringSegmentIDs[1]);
                // Increment color count for the current cell's segment.
                segmentColorCounts[segmentIdMap[r][c]][(r + c) % 2]++;
                // Add current cell's coordinates to its segment.
                segmentCellPositions[segmentIdMap[r][c]].push([r, c]);
            } else if (neighboringSegmentIDs.length === 1) {
                // One adjacent segment: extend existing segment.
                segmentIdMap[r][c] = neighboringSegmentIDs[0];
                // Increment color count for the current cell's segment.
                segmentColorCounts[neighboringSegmentIDs[0]][(r + c) % 2]++;
                // Add current cell's coordinates to its segment.
                segmentCellPositions[neighboringSegmentIDs[0]].push([r, c]);
            } else {
                // No adjacent segments: start a new segment.
                segmentIdMap[r][c] = currentSegmentIdentifier;
                segmentColorCounts[currentSegmentIdentifier] = [0, 0]; // Initialize counts for new segment.
                // Increment color count for the current cell.
                segmentColorCounts[currentSegmentIdentifier][(r + c) % 2]++;
                segmentCellPositions[currentSegmentIdentifier] = [[r, c]]; // Add current cell to new segment.
                currentSegmentIdentifier++; // Increment ID for the next new segment.
            }
        }
    }

    // Calculate the final result by summing products of color counts for each valid segment.
    var finalResult = 0;
    for (var segmentInfo of segmentColorCounts) {
        if (segmentInfo !== null) {
            finalResult += segmentInfo[0] * segmentInfo[1]; // Product of 'black' and 'white' cell counts.
        }
    }

    // Output the calculated final result.
    console.log(finalResult);
}

// Helper function for performing element-wise operations on vectors.
function VectorOperation(vectorOne, vectorTwo, operationType) {
    var resultVector = []; // Stores the result of the operation.

    // Handle cases where vector lengths differ.
    if (vectorOne.length !== vectorTwo.length) {
        if (vectorTwo.length === 1) {
            // If vectorTwo is a single value, create a vector of the same length as vectorOne.
            vectorTwo = Array.from({ length: (vectorOne.length) }, () => vectorTwo);
        } else {
            // If lengths are incompatible and vectorTwo is not a single value, return null.
            return null;
        }
    }

    // Perform the specified operation element by element.
    for (var i = 0; i < vectorOne.length; i++) {
        if (operationType === '+') {
            resultVector.push(vectorOne[i] + vectorTwo[i]);
        }
        if (operationType === '-') {
            resultVector.push(vectorOne[i] - vectorTwo[i]);
        }
        if (operationType === '*') {
            resultVector.push(vectorOne[i] * vectorTwo[i]);
        }
        if (operationType === '/') {
            resultVector.push(vectorOne[i] / vectorTwo[i]);
        }
        if (operationType === '%') {
            resultVector.push(vectorOne[i] % vectorTwo[i]);
        }
        if (operationType === '||') { // Custom operation for maximum of two elements.
            resultVector.push(Math.max(vectorOne[i], vectorTwo[i]));
        }
    }
    return resultVector; // Return the computed vector.
}


// Entry point: Read input from standard input and pass it to the main processing function.
ProcessGrid(require("fs").readFileSync("/dev/stdin", "utf8"));