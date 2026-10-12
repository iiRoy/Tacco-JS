let rawInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (dataChunk) => {
  rawInputBuffer += dataChunk;
});
process.stdin.on('end', () => {
  const processedInputLines = rawInputBuffer.split('\n');
  initiateGridPathSimulation(processedInputLines);
});

function initiateGridPathSimulation(inputSource) {
    let currentInputLineIndex = 0;

    // Utility to extract and parse a line from the input source
    const parseNextInputLine = () => {
        return inputSource[currentInputLineIndex++].split(' ').map(parseFloat);
    };

    // Map of Maps to store accumulated path counts: Map<y_coordinate, Map<x_coordinate, count_value>>
    let pathAccumulatorMap;

    // Helper to safely retrieve a path count for a given coordinate
    const retrievePathCount = (yCoord, xCoord) => {
        return pathAccumulatorMap.get(yCoord)?.get(xCoord) || 0;
    };

    // Helper to safely add a value to a path count for a given coordinate
    const incrementPathCount = (yCoord, xCoord, valueToAdd) => {
        if (!pathAccumulatorMap.has(yCoord)) {
            pathAccumulatorMap.set(yCoord, new Map());
        }
        const rowSpecificMap = pathAccumulatorMap.get(yCoord);
        rowSpecificMap.set(xCoord, (rowSpecificMap.get(xCoord) || 0) + valueToAdd);
    };

    // Main loop to process each grid scenario from the input
    while (true) {
        const [gridWidth, gridHeight] = parseNextInputLine();

        if (gridWidth === 0 && gridHeight === 0) {
            break; // Termination condition
        }

        // Read the actual grid data rows
        const actualGridDataRows = Array.from({ length: gridHeight }, () => parseNextInputLine());

        // Construct the complete grid, including a "blocker" row at the end.
        // This blocker row mimics the original's `dummy` array behavior for boundary checks.
        const completeGridStructure = [...actualGridDataRows, Array(gridWidth).fill(2)];

        // Helper to determine a cell's type, treating out-of-bounds as type 2 (blocker)
        const determineCellType = (yCoord, xCoord) => {
            if (xCoord < 0 || xCoord >= gridWidth) return 2; // Horizontal boundaries
            if (yCoord >= completeGridStructure.length) return 2; // Vertical boundaries (beyond the blocker row)
            return completeGridStructure[yCoord][xCoord];
        };

        pathAccumulatorMap = new Map(); // Reset path counts for the new scenario

        // Initialize path counts for the first row (y=0)
        Array.from({ length: gridWidth }, (_, xCoord) => xCoord).forEach(xCoord => {
            if (determineCellType(0, xCoord) === 0) {
                incrementPathCount(0, xCoord, 1);
            }
        });

        // Propagate path counts through the grid rows
        Array.from({ length: gridHeight }, (_, yCoord) => yCoord).forEach(yCoord => {
            Array.from({ length: gridWidth }, (_, xCoord) => xCoord).forEach(xCoord => {
                const currentCellPathCount = retrievePathCount(yCoord, xCoord);
                if (currentCellPathCount === 0) return; // No paths to propagate from this cell

                const cellBehaviorIdentifier = determineCellType(yCoord, xCoord);

                // Dispatch object to handle different cell behaviors
                const behaviorHandler = {
                    0: () => { // Type 0: Propagate to three adjacent cells in the next row
                        const nextRowY = yCoord + 1;
                        if (determineCellType(nextRowY, xCoord - 1) !== 2) incrementPathCount(nextRowY, xCoord - 1, currentCellPathCount);
                        if (determineCellType(nextRowY, xCoord) !== 2) incrementPathCount(nextRowY, xCoord, currentCellPathCount);
                        if (determineCellType(nextRowY, xCoord + 1) !== 2) incrementPathCount(nextRowY, xCoord + 1, currentCellPathCount);
                    },
                    1: () => { /* Type 1: No propagation, paths terminate here */ },
                    2: () => { // Type 2: Propagate to the cell two rows down
                        incrementPathCount(yCoord + 2, xCoord, currentCellPathCount);
                    }
                };
                (behaviorHandler[cellBehaviorIdentifier] || (() => {}))(); // Execute the specific behavior or do nothing
            });
        });

        // Calculate the final total sum from the last two relevant rows (gridHeight and gridHeight + 1)
        let totalFinalPathSum = 0;
        Array.from({ length: 2 }, (_, rowOffset) => gridHeight + rowOffset).forEach(yCoord => {
            Array.from({ length: gridWidth }, (_, xCoord) => xCoord).forEach(xCoord => {
                totalFinalPathSum += retrievePathCount(yCoord, xCoord);
            });
        });

        console.log(totalFinalPathSum);
    }
}
