function ProcessGridData(rawDataBuffer) {
    // Helper function for robust integer parsing with error handling.
    const parseNumericValue = (stringValue, base = 10) => {
        const parsedInteger = parseInt(stringValue, base);
        if (Number.isNaN(parsedInteger)) {
            throw new Error(`Input parsing error: Cannot convert "${stringValue}" to a number.`);
        }
        return parsedInteger;
    };

    // Determines the expected character ('#' or '.') for a checkerboard pattern at a given cell.
    const getCheckerboardChar = (rowCoordinate, colCoordinate) => {
        return (rowCoordinate + colCoordinate) % 2 === 0 ? '#' : '.';
    };

    // Constants for clarity and maintainability.
    const UNASSIGNED_COMPONENT_MARKER = -1;
    const EVEN_SUM_PARITY = 0; // Represents (row + col) % 2 === 0
    const ODD_SUM_PARITY = 1;  // Represents (row + col) % 2 === 1

    // ---------------------------------------------------------------------
    // Stage 1: Input Processing and Grid Initialization
    // ---------------------------------------------------------------------

    // Trim whitespace from the raw buffer, split into lines, and then split each line by space.
    // This creates a 2D array where the first element of each subsequent row is the actual grid string.
    const processedInputLines = rawDataBuffer.trim().split("\n").map(line => line.split(" "));

    // Validate and extract grid dimensions from the first line.
    if (processedInputLines.length < 1 || processedInputLines[0].length < 2) {
        throw new Error("Invalid input format: Grid dimensions are missing or malformed.");
    }
    const gridHeight = parseNumericValue(processedInputLines[0][0]);
    const gridWidth = parseNumericValue(processedInputLines[0][1]);

    // Perform basic validation on extracted dimensions.
    if (gridHeight <= 0 || gridWidth <= 0) {
        throw new Error(`Invalid grid dimensions: Height (${gridHeight}) and Width (${gridWidth}) must be positive.`);
    }
    // Ensure sufficient input lines are provided for the declared grid height.
    if (processedInputLines.length < gridHeight + 1) { // +1 accounts for the dimension line itself
        throw new Error(`Insufficient input data: Expected ${gridHeight} rows but only found ${processedInputLines.length - 1}.`);
    }

    // Declare and initialize the primary grid data structures.
    let characterGridInput = [];          // Stores the actual input characters (e.g., '#', '.')
    let checkerboardPatternMatch = [];    // Marks cells that match the checkerboard pattern (1 for match, 0 for mismatch)
    let componentIdAssignment = [];       // Stores the connected component ID for each cell

    // Populate grid structures, handling potential missing line data.
    for (let r = 0; r < gridHeight; r++) {
        const currentLineData = processedInputLines[r + 1]; // Grid data starts from the second line (index 1)
        if (!currentLineData || currentLineData.length === 0 || currentLineData[0].length !== gridWidth) {
            throw new Error(`Data mismatch for row ${r}: Expected ${gridWidth} characters, found ${currentLineData ? currentLineData[0].length : 'none'}.`);
        }
        characterGridInput.push(currentLineData[0]); // Assuming the actual grid row is the first string in the split array

        // Initialize rows for the other two matrices.
        checkerboardPatternMatch.push(new Array(gridWidth).fill(0));
        componentIdAssignment.push(new Array(gridWidth).fill(UNASSIGNED_COMPONENT_MARKER));
    }

    // Populate the checkerboard pattern match grid.
    for (let r = 0; r < gridHeight; r++) {
        for (let c = 0; c < gridWidth; c++) {
            const cellCharacter = characterGridInput[r][c]; // Direct character access
            const expectedPatternChar = getCheckerboardChar(r, c);
            if (cellCharacter === expectedPatternChar) {
                checkerboardPatternMatch[r][c] = 1; // Mark as matching the pattern
            }
        }
    }

    // ---------------------------------------------------------------------
    // Stage 2: Connected Component Analysis
    // ---------------------------------------------------------------------

    let nextAvailableComponentTag = 0; // Unique identifier for new components.
    // Stores [count_of_even_parity_cells, count_of_odd_parity_cells] for each component ID.
    let componentParityCounts = [];
    // Stores lists of [row, col] coordinates for each component ID.
    let componentCellCoordinateLists = [];

    // Iterate through each cell of the grid to identify and merge components.
    for (let r = 0; r < gridHeight; r++) {
        for (let c = 0; c < gridWidth; c++) {
            let adjacentComponentTags = []; // Collects component IDs of relevant neighbors.

            // Check the cell directly above (top neighbor).
            if (r > 0 && checkerboardPatternMatch[r - 1][c] === checkerboardPatternMatch[r][c]) {
                adjacentComponentTags.push(componentIdAssignment[r - 1][c]);
            }
            // Check the cell directly to the left (left neighbor).
            if (c > 0 && checkerboardPatternMatch[r][c - 1] === checkerboardPatternMatch[r][c]) {
                adjacentComponentTags.push(componentIdAssignment[r][c - 1]);
            }

            // Determine the parity of the current cell's coordinate sum.
            const currentCellParity = (r + c) % 2 === 0 ? EVEN_SUM_PARITY : ODD_SUM_PARITY;

            if (adjacentComponentTags.length > 1) {
                // Case: Multiple neighbors with the same checkerboard pattern status.
                // This implies a potential merge of two existing components.
                const firstNeighborTag = adjacentComponentTags[0];
                const secondNeighborTag = adjacentComponentTags[1];

                if (firstNeighborTag !== secondNeighborTag) {
                    // Components are distinct; merge them into the component with the smaller ID.
                    const primaryComponentTag = Math.min(firstNeighborTag, secondNeighborTag);
                    const secondaryComponentTag = Math.max(firstNeighborTag, secondNeighborTag);

                    // Reassign cells from the secondary (larger ID) component to the primary.
                    const cellsToReassign = componentCellCoordinateLists[secondaryComponentTag];
                    if (cellsToReassign) { // Ensure the secondary component wasn't already merged/nullified.
                        for (let k = 0; k < cellsToReassign.length; k++) {
                            const [cellRow, cellCol] = cellsToReassign[k];
                            componentIdAssignment[cellRow][cellCol] = primaryComponentTag;
                            componentCellCoordinateLists[primaryComponentTag].push([cellRow, cellCol]);
                        }
                    }

                    // Aggregate parity counts from the secondary component into the primary.
                    if (componentParityCounts[primaryComponentTag] && componentParityCounts[secondaryComponentTag]) {
                        componentParityCounts[primaryComponentTag][EVEN_SUM_PARITY] += componentParityCounts[secondaryComponentTag][EVEN_SUM_PARITY];
                        componentParityCounts[primaryComponentTag][ODD_SUM_PARITY] += componentParityCounts[secondaryComponentTag][ODD_SUM_PARITY];
                    }
                    
                    // Mark the secondary component as merged/invalid.
                    componentParityCounts[secondaryComponentTag] = null;
                    componentCellCoordinateLists[secondaryComponentTag] = null;
                }
                
                // Assign the current cell to the (now unified) primary component.
                const assignedTag = Math.min(...adjacentComponentTags); // Using spread for readability
                componentIdAssignment[r][c] = assignedTag;
                componentParityCounts[assignedTag][currentCellParity]++;
                componentCellCoordinateLists[assignedTag].push([r, c]);

            } else if (adjacentComponentTags.length === 1) {
                // Case: Exactly one neighbor with the same checkerboard pattern status.
                // The current cell joins this existing component.
                const existingTag = adjacentComponentTags[0];
                componentIdAssignment[r][c] = existingTag;
                componentParityCounts[existingTag][currentCellParity]++;
                componentCellCoordinateLists[existingTag].push([r, c]);

            } else {
                // Case: No relevant neighbors. A new connected component begins here.
                const freshComponentTag = nextAvailableComponentTag++;
                componentIdAssignment[r][c] = freshComponentTag;
                
                // Initialize counts and coordinate list for the new component.
                componentParityCounts[freshComponentTag] = [0, 0];
                componentParityCounts[freshComponentTag][currentCellParity]++;
                componentCellCoordinateLists[freshComponentTag] = [[r, c]];
            }
        }
    }

    // ---------------------------------------------------------------------
    // Stage 3: Final Calculation and Output
    // ---------------------------------------------------------------------

    let totalProductSum = 0; // Accumulator for the final result.

    // Filter out components that were merged (marked as null).
    const activeComponentCounts = componentParityCounts.filter(counts => counts !== null);

    // Calculate the product of even and odd parity cell counts for each active component.
    for (const countsArray of activeComponentCounts) {
        // Multiply the count of cells with even (r+c) sum by those with odd (r+c) sum within this component.
        totalProductSum += countsArray[EVEN_SUM_PARITY] * countsArray[ODD_SUM_PARITY];
    }

    // Output the final accumulated result to the console.
    console.log(totalProductSum);
}

// Entry point: Read input from standard input and pass it to the main processing function.
// This assumes a Node.js environment where 'fs' module is available and '/dev/stdin' is the input source.
ProcessGridData(require("fs").readFileSync("/dev/stdin", "utf8"));