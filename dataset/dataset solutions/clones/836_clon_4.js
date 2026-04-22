class GameGridProcessor {
    constructor(initialConfiguration) {
        this.rows = 12;
        this.cols = 6;
        this.gridState = new Map(); // Stores cell values by string key "r,c"
        for (let r = 0; r < this.rows; ++r) {
            for (let c = 0; c < this.cols; ++c) {
                this.gridState.set(`${r},${c}`, initialConfiguration[r][c]);
            }
        }
        this.neighborOffsets = [[-1, 0], [0, -1], [0, 1], [1, 0]];
    }

    // Checks if a given coordinate is within the board boundaries
    isLocationValid(r, c) {
        return r >= 0 && r < this.rows && c >= 0 && c < this.cols;
    }

    // Retrieves the value of a cell at a given coordinate
    getCellContent(r, c) {
        return this.isLocationValid(r, c) ? this.gridState.get(`${r},${c}`) : undefined;
    }

    // Assigns a value to a cell at a given coordinate
    setCellContent(r, c, val) {
        if (this.isLocationValid(r, c)) {
            this.gridState.set(`${r},${c}`, val);
        }
    }

    // Identifies all cells belonging to a connected component of a specific character
    // Returns an object containing the size of the component and a Set of its coordinates
    discoverComponent(startR, startC, targetChar) {
        const traversed = new Set();
        const componentCells = new Set();
        const searchQueue = [`${startR},${startC}`]; // Using a queue for iterative BFS

        while (searchQueue.length > 0) {
            const currentCoordKey = searchQueue.shift();
            if (traversed.has(currentCoordKey)) continue;
            traversed.add(currentCoordKey);

            const [r, c] = currentCoordKey.split(',').map(Number);
            
            if (!this.isLocationValid(r, c) || this.getCellContent(r, c) !== targetChar) continue;

            componentCells.add(currentCoordKey);

            for (const [dr, dc] of this.neighborOffsets) {
                const nextR = r + dr;
                const nextC = c + dc;
                const nextCoordKey = `${nextR},${nextC}`;
                if (this.isLocationValid(nextR, nextC) && this.getCellContent(nextR, nextC) === targetChar && !traversed.has(nextCoordKey)) {
                    searchQueue.push(nextCoordKey);
                }
            }
        }
        return { count: componentCells.size, locations: componentCells };
    }

    // Clears a connected component of a specific character and adjacent 'O' blocks
    // This function modifies the gridState directly
    removeComponent(startR, startC, targetChar) {
        const processQueue = [[startR, startC]];
        const processedForRecursion = new Set(); // To avoid processing the same cell multiple times for recursion
        const cellsEffectivelyCleared = new Set(); // To track all cells that have been cleared to '.'

        while (processQueue.length > 0) {
            const [r, c] = processQueue.shift();
            const currentCoordKey = `${r},${c}`;

            if (processedForRecursion.has(currentCoordKey)) continue;
            processedForRecursion.add(currentCoordKey);

            const cellContent = this.getCellContent(r, c);

            if (cellContent === targetChar) {
                if (!cellsEffectivelyCleared.has(currentCoordKey)) {
                    this.setCellContent(r, c, '.');
                    cellsEffectivelyCleared.add(currentCoordKey);
                }

                for (const [dr, dc] of this.neighborOffsets) {
                    const nextR = r + dr;
                    const nextC = c + dc;
                    const nextCoordKey = `${nextR},${nextC}`;

                    if (this.isLocationValid(nextR, nextC)) {
                        const nextCellContent = this.getCellContent(nextR, nextC);
                        if (nextCellContent === targetChar && !processedForRecursion.has(nextCoordKey)) {
                            processQueue.push([nextR, nextC]); // Continue chain reaction for same color
                        } else if (nextCellContent === 'O' && !cellsEffectivelyCleared.has(nextCoordKey)) {
                            this.setCellContent(nextR, nextC, '.'); // Clear 'O' block, but do not recurse from it
                            cellsEffectivelyCleared.add(nextCoordKey);
                        }
                    }
                }
            }
            // 'O' blocks are only cleared if they are neighbors of a 'targetChar' block.
            // They don't initiate recursive clearing themselves in this function.
        }
    }

    // Applies gravity to the entire board, moving blocks downwards to fill empty spaces
    applyDownwardMovement() {
        for (let c = 0; c < this.cols; ++c) {
            const columnElements = [];
            for (let r = this.rows - 1; r >= 0; --r) { // Scan column from bottom to top
                const val = this.getCellContent(r, c);
                if (val !== '.') {
                    columnElements.push(val);
                }
            }
            // Refill column from bottom, placing non-empty elements first, then '.'
            for (let r = this.rows - 1; r >= 0; --r) {
                this.setCellContent(r, c, columnElements.shift() || '.');
            }
        }
    }
}

// Main execution logic
const receivedInput = process.stdin.readFileSync(0, 'utf8');
const processedLines = receivedInput.trim().split("\n");
const totalTestCases = parseInt(processedLines.shift());

for (let currentScenario = 0; currentScenario < totalTestCases; ++currentScenario) {
    const scenarioGridData = [];
    for (let r = 0; r < 12; ++r) {
        scenarioGridData.push(processedLines.shift().split(''));
    }

    const currentSimulationBoard = new GameGridProcessor(scenarioGridData);
    let cumulativeChains = 0;

    while (true) {
        const eliminationTargets = new Set(); // Stores coordinates of all blocks to be cleared in this turn
        const alreadyExplored = new Set(); // To prevent re-initiating component detection on already processed cells

        // Phase 1: Identify all components of 4 or more
        for (let r = 0; r < currentSimulationBoard.rows; ++r) {
            for (let c = 0; c < currentSimulationBoard.cols; ++c) {
                const currentCellKey = `${r},${c}`;
                if (alreadyExplored.has(currentCellKey)) continue;

                const cellValue = currentSimulationBoard.getCellContent(r, c);
                if (cellValue !== '.' && cellValue !== 'O') { // Only colored blocks can form chains
                    const { count, locations } = currentSimulationBoard.discoverComponent(r, c, cellValue);
                    
                    // Mark all cells in this component as explored for this detection round
                    locations.forEach(coord => alreadyExplored.add(coord));

                    if (count >= 4) {
                        locations.forEach(coord => eliminationTargets.add(coord));
                    }
                }
            }
        }

        if (eliminationTargets.size === 0) {
            break; // No chains found in this iteration, simulation ends for this board
        }

        cumulativeChains++;

        // Phase 2: Eliminate identified components
        // Convert Set to Array to allow iteration and potential modification during processing
        const coordinatesForRemoval = Array.from(eliminationTargets).map(s => s.split(',').map(Number));
        coordinatesForRemoval.forEach(([r, c]) => {
            const cellVal = currentSimulationBoard.getCellContent(r, c);
            if (cellVal !== '.') { // Only attempt removal if cell hasn't already been cleared by a previous call
                currentSimulationBoard.removeComponent(r, c, cellVal);
            }
        });

        // Phase 3: Apply gravity
        currentSimulationBoard.applyDownwardMovement();
    }
    console.log(cumulativeChains);
}