const GridCoord = function (horizontal, vertical) {
    if (typeof horizontal !== 'number' || typeof vertical !== 'number' || !Number.isInteger(horizontal) || !Number.isInteger(vertical)) {
        console.warn("GridCoord expects integer numeric coordinates. Defaulting to (0,0).");
        this.horizontal = 0;
        this.vertical = 0;
    } else {
        this.horizontal = horizontal;
        this.vertical = vertical;
    }

    this.isEqual = function(otherCoord) {
        return otherCoord instanceof GridCoord && this.horizontal === otherCoord.horizontal && this.vertical === otherCoord.vertical;
    };
};

const visualRenderer = (function () {
    let drawingSurfaceElement = null;
    let renderingContext2D = null;
    let canvasIdString = '';
    const cellDisplaySize = 12; // Pixels per cell, slightly larger than original
    const liveCellColor = '#006400'; // Dark green for living cells
    const deadCellColor = '#F0FFF0'; // Honeydew for dead cells
    const gridLineColor = '#696969'; // Dim gray for grid boundaries

    function initializeDrawingSurface(selectorString) {
        if (!selectorString || typeof selectorString !== 'string' || selectorString.trim() === '') {
            console.error("A valid CSS selector string is required to initialize the drawing surface.");
            return false;
        }

        const targetDOMElement = document.querySelector(selectorString);
        if (!(targetDOMElement instanceof HTMLCanvasElement)) {
            console.error(`Element selected by '${selectorString}' is not an HTMLCanvasElement.`);
            drawingSurfaceElement = null;
            renderingContext2D = null;
            return false;
        }

        drawingSurfaceElement = targetDOMElement;
        renderingContext2D = drawingSurfaceElement.getContext('2d');
        canvasIdString = selectorString;

        // Apply device pixel ratio for sharper rendering on high-resolution displays
        const devicePixelRatio = window.devicePixelRatio || 1;
        const currentRect = drawingSurfaceElement.getBoundingClientRect();
        drawingSurfaceElement.width = currentRect.width * devicePixelRatio;
        drawingSurfaceElement.height = currentRect.height * devicePixelRatio;
        renderingContext2D.scale(devicePixelRatio, devicePixelRatio);

        return true;
    }

    function drawGridCell(hPosition, vPosition, isPopulated) {
        // Simple bounds check for drawing
        if (hPosition < 0 || vPosition < 0 || hPosition >= simulationCore.gridWidth || vPosition >= simulationCore.gridHeight) {
            // console.warn(`Attempted to draw cell outside grid boundaries: (${hPosition}, ${vPosition})`);
            return;
        }

        renderingContext2D.fillStyle = isPopulated ? liveCellColor : deadCellColor;

        const drawX = hPosition * cellDisplaySize + 1;
        const drawY = vPosition * cellDisplaySize + 1;
        const drawDimension = cellDisplaySize - 2; // Subtract 2 for a visible border effect

        renderingContext2D.fillRect(drawX, drawY, drawDimension, drawDimension);
    }

    function processCanvasInteraction(mouseEvent) {
        const canvasElement = this; // 'this' refers to the canvas element in this context
        let initialToggleState; // Stores the state a cell should be toggled to

        const getGridCoordinates = (event) => {
            const canvasBoundingRect = canvasElement.getBoundingClientRect();
            const clientXAdjusted = event.clientX - canvasBoundingRect.left;
            const clientYAdjusted = event.clientY - canvasBoundingRect.top;

            const gridX = Math.floor(clientXAdjusted / cellDisplaySize);
            const gridY = Math.floor(clientYAdjusted / cellDisplaySize);
            return new GridCoord(gridX, gridY);
        };

        const applyCellUpdate = (coordinates) => {
            if (!coordinates || coordinates.horizontal < 0 || coordinates.vertical < 0 ||
                coordinates.horizontal >= simulationCore.gridWidth || coordinates.vertical >= simulationCore.gridHeight) {
                return; // Ignore clicks outside valid grid area
            }

            // Determine the state to toggle to on the first click
            if (initialToggleState === undefined) {
                initialToggleState = !simulationCore.currentGenerationState[coordinates.horizontal][coordinates.vertical];
            }

            simulationCore.currentGenerationState[coordinates.horizontal][coordinates.vertical] = initialToggleState;
            drawGridCell(coordinates.horizontal, coordinates.vertical, initialToggleState);
        };

        applyCellUpdate(getGridCoordinates(mouseEvent));

        // Bind a namespaced mousemove event for dragging functionality
        $(canvasIdString).on('mousemove.cellInteraction', (moveEvent) => {
            applyCellUpdate(getGridCoordinates(moveEvent));
        });
    }

    function renderChangedCells() {
        let cellsUpdatedCount = 0; // Track number of cells actually redrawn
        for (let h = 0; h < simulationCore.gridWidth; h++) {
            for (let v = 0; v < simulationCore.gridHeight; v++) {
                if (simulationCore.currentGenerationState[h][v] !== simulationCore.nextGenerationBuffer[h][v]) {
                    drawGridCell(h, v, simulationCore.nextGenerationBuffer[h][v]);
                    cellsUpdatedCount++;
                }
            }
        }
        // console.log(`Optimized render: ${cellsUpdatedCount} cells updated.`);
    }

    function renderAllCells() {
        // Clear the entire canvas first for a clean redraw
        renderingContext2D.clearRect(0, 0, drawingSurfaceElement.width, drawingSurfaceElement.height);

        for (let h = 0; h < simulationCore.gridWidth; h++) {
            for (let v = 0; v < simulationCore.gridHeight; v++) {
                drawGridCell(h, v, simulationCore.currentGenerationState[h][v]);
            }
        }
        drawGridLines(); // Re-draw grid lines on top
    }

    function drawGridLines() {
        renderingContext2D.strokeStyle = gridLineColor;
        renderingContext2D.lineWidth = 1;

        // Draw vertical grid lines
        for (let h = 0; h <= simulationCore.gridWidth; h++) {
            const lineCoordX = h * cellDisplaySize + 0.5; // Offset by 0.5 for crisp lines
            renderingContext2D.beginPath();
            renderingContext2D.moveTo(lineCoordX, 0);
            renderingContext2D.lineTo(lineCoordX, simulationCore.gridHeight * cellDisplaySize);
            renderingContext2D.stroke();
        }

        // Draw horizontal grid lines
        for (let v = 0; v <= simulationCore.gridHeight; v++) {
            const lineCoordY = v * cellDisplaySize + 0.5; // Offset by 0.5 for crisp lines
            renderingContext2D.beginPath();
            renderingContext2D.moveTo(0, lineCoordY);
            renderingContext2D.lineTo(simulationCore.gridWidth * cellDisplaySize, lineCoordY);
            renderingContext2D.stroke();
        }
    }

    return {
        drawingSurfaceElement: drawingSurfaceElement,
        renderingContext2D: renderingContext2D,
        canvasIdString: canvasIdString,
        cellDisplaySize: cellDisplaySize,
        liveCellColor: liveCellColor,
        deadCellColor: deadCellColor,
        gridLineColor: gridLineColor,
        initializeDrawingSurface: initializeDrawingSurface,
        drawGridCell: drawGridCell,
        processCanvasInteraction: processCanvasInteraction,
        renderAllCells: renderAllCells,
        renderChangedCells: renderChangedCells,
        drawGridLines: drawGridLines
    };
}());

const simulationCore = (function () {
    let gridHeightCount = 0;
    let gridWidthCount = 0;
    let currentGenerationState = []; // The active state of the grid
    let nextGenerationBuffer = []; // Buffer to compute next state
    let simulationSpeedMs = 150; // Default interval between generations (milliseconds)
    let generationTimerId = null; // ID returned by setInterval
    let simulationActive = false; // Flag to check if simulation is running

    function setupGameGrid(canvasSelector) {
        if (!visualRenderer.initializeDrawingSurface(canvasSelector)) {
            console.error("Failed to set up visual components. Game grid initialization aborted.");
            return false;
        }

        const effectiveCanvasWidth = visualRenderer.drawingSurfaceElement.width / (window.devicePixelRatio || 1);
        const effectiveCanvasHeight = visualRenderer.drawingSurfaceElement.height / (window.devicePixelRatio || 1);

        gridWidthCount = Math.floor((effectiveCanvasWidth - 1) / visualRenderer.cellDisplaySize);
        gridHeightCount = Math.floor((effectiveCanvasHeight - 1) / visualRenderer.cellDisplaySize);

        // Initialize grid arrays with all cells dead using Array.from and fill
        currentGenerationState = Array.from({ length: gridWidthCount }, () => Array(gridHeightCount).fill(false));
        nextGenerationBuffer = Array.from({ length: gridWidthCount }, () => Array(gridHeightCount).fill(false));

        // Initial canvas background fill
        visualRenderer.renderingContext2D.fillStyle = visualRenderer.deadCellColor;
        visualRenderer.renderingContext2D.fillRect(0, 0, effectiveCanvasWidth, effectiveCanvasHeight);

        visualRenderer.drawGridLines();

        // Bind mouse events for user interaction
        $(canvasSelector).on('mousedown.gameControls', visualRenderer.processCanvasInteraction);
        $('body').on('mouseup.gameControls', () => {
            $(canvasSelector).off('mousemove.cellInteraction'); // Unbind specific mousemove handler
        });

        visualRenderer.renderAllCells(); // Ensure initial empty grid is drawn
        return true;
    }

    function calculateLiveNeighbors(hCoord, vCoord) {
        let activeNeighborCount = 0;

        // Define relative coordinates for all 8 neighbors
        const neighborOffsets = [
            [-1, -1], [0, -1], [1, -1],
            [-1,  0],          [1,  0],
            [-1,  1], [0,  1], [1,  1]
        ];

        for (const [deltaH, deltaV] of neighborOffsets) {
            // Apply toroidal (wrap-around) boundary conditions
            const neighborH = (hCoord + deltaH + gridWidthCount) % gridWidthCount;
            const neighborV = (vCoord + deltaV + gridHeightCount) % gridHeightCount;

            if (currentGenerationState[neighborH][neighborV]) {
                activeNeighborCount++;
            }
        }
        return activeNeighborCount;
    }

    function advanceToNextGeneration() {
        let anyCellStateChanged = false; // Optimization: track if any cell changed

        // First pass: Calculate next state for all cells and store in buffer
        for (let h = 0; h < gridWidthCount; h++) {
            for (let v = 0; v < gridHeightCount; v++) {
                const neighbors = calculateLiveNeighbors(h, v);
                const currentState = currentGenerationState[h][v];
                let potentialNextState = currentState; // Assume no change by default

                if (currentState) { // Cell is alive
                    if (neighbors < 2 || neighbors > 3) {
                        potentialNextState = false; // Dies due to underpopulation or overpopulation
                    }
                } else { // Cell is dead
                    if (neighbors === 3) {
                        potentialNextState = true; // Becomes alive due to reproduction
                    }
                }

                if (potentialNextState !== currentState) {
                    anyCellStateChanged = true;
                }
                nextGenerationBuffer[h][v] = potentialNextState;
            }
        }

        // Second pass: Update the current state and render changes
        if (anyCellStateChanged) {
            visualRenderer.renderChangedCells(); // Only redraw cells that changed
            // Copy buffer to current state
            for (let h = 0; h < gridWidthCount; h++) {
                for (let v = 0; v < gridHeightCount; v++) {
                    currentGenerationState[h][v] = nextGenerationBuffer[h][v];
                }
            }
        } else {
            // If no cells changed, the pattern has stabilized or died out.
            // Automatically stop the simulation to prevent infinite loops on stable patterns.
            if (simulationActive) {
                console.info("Simulation stabilized or died out. Auto-stopping.");
                toggleSimulationState();
            }
        }
    }

    function toggleSimulationState() {
        if (!simulationActive) {
            if (simulationSpeedMs <= 0) {
                console.error("Simulation speed is zero or negative. Cannot start simulation.");
                return;
            }
            simulationActive = true;
            generationTimerId = setInterval(() => simulationCore.advanceToNextGeneration(), simulationSpeedMs);
            console.log(`Simulation started at ${simulationSpeedMs}ms interval.`);
        } else {
            simulationActive = false;
            clearInterval(generationTimerId);
            generationTimerId = null; // Clear timer ID
            console.log("Simulation paused.");
        }
    }

    async function loadPatternFromRLE(resourceURL) {
        if (!resourceURL || typeof resourceURL !== 'string' || !resourceURL.endsWith('.rle')) {
            console.error("Invalid or missing RLE resource URL.");
            return;
        }

        const patternPadding = 10; // Slightly larger padding than original

        let patternTextContent;
        try {
            const fetchResponse = await fetch(resourceURL);
            if (!fetchResponse.ok) {
                throw new Error(`Failed to fetch RLE pattern: HTTP status ${fetchResponse.status}`);
            }
            patternTextContent = await fetchResponse.text();
        } catch (error) {
            console.error("Error loading RLE pattern:", error);
            return;
        }

        const rlePatternRegex = /x\s*=\s*(\d+)\s*,\s*y\s*=\s*(\d+)\s*(?:,\s*rule\s*=\s*([^\n\r]*))?\r?\n([^!]*)!/;
        const regexMatch = patternTextContent.match(rlePatternRegex);

        if (!regexMatch) {
            console.error("RLE pattern format invalid or incomplete.");
            return;
        }

        const patternLogicalWidth = parseInt(regexMatch[1], 10);
        const patternLogicalHeight = parseInt(regexMatch[2], 10);
        const encodedPatternData = regexMatch[4].replace(/\s+/g, ""); // Remove all whitespace

        // Dynamically resize canvas to fit the pattern with padding
        const requiredCanvasWidth = visualRenderer.cellDisplaySize * (patternLogicalWidth + patternPadding * 2);
        const requiredCanvasHeight = visualRenderer.cellDisplaySize * (patternLogicalHeight + patternPadding * 2);

        // Update canvas dimensions using jQuery for convenience
        $(visualRenderer.canvasIdString).attr('width', requiredCanvasWidth);
        $(visualRenderer.canvasIdString).attr('height', requiredCanvasHeight);

        // Re-initialize the simulation grid and visual renderer with new dimensions
        $(visualRenderer.canvasIdString).off('.gameControls'); // Unbind all namespaced event handlers
        $('body').off('.gameControls');
        if (!setupGameGrid(visualRenderer.canvasIdString)) {
            console.error("Failed to re-initialize simulation after canvas resize.");
            return;
        }

        clearGrid(); // Ensure grid is empty before loading

        let currentParseX = patternPadding;
        let currentParseY = patternPadding;
        let repetitionCount = '';

        for (let charIndex = 0; charIndex < encodedPatternData.length; charIndex++) {
            const character = encodedPatternData[charIndex];

            if (/\d/.test(character)) {
                repetitionCount += character;
            } else {
                const count = repetitionCount === '' ? 1 : parseInt(repetitionCount, 10);
                repetitionCount = ''; // Reset for next run

                switch (character) {
                    case 'b': // Dead cell(s)
                        currentParseX += count;
                        break;
                    case 'o': // Live cell(s)
                        for (let k = 0; k < count; k++) {
                            const targetX = currentParseX + k;
                            if (targetX < gridWidthCount && currentParseY < gridHeightCount) {
                                currentGenerationState[targetX][currentParseY] = true;
                            }
                        }
                        currentParseX += count;
                        break;
                    case '$': // Newline
                        currentParseY += count;
                        currentParseX = patternPadding; // Reset X for the new row
                        break;
                    case '!': // End of pattern (handled by regex already, but good as a guard)
                        break;
                    default:
                        console.warn(`Unexpected character encountered in RLE data: '${character}'`);
                }
            }
        }
        visualRenderer.renderAllCells(); // Display the loaded pattern
        console.log(`Pattern loaded: ${resourceURL}`);
    }

    function getSimulationStatus() {
        return simulationActive;
    }

    function modifySimulationSpeed(increaseSpeed) {
        const speedStep = 20; // Change interval by 20ms
        const minAllowedSpeed = 30; // Fastest possible interval
        const maxAllowedSpeed = 1200; // Slowest possible interval

        let newSpeedValue = simulationSpeedMs;

        if (increaseSpeed) {
            newSpeedValue = Math.max(minAllowedSpeed, simulationSpeedMs - speedStep);
        } else {
            newSpeedValue = Math.min(maxAllowedSpeed, simulationSpeedMs + speedStep);
        }

        if (newSpeedValue !== simulationSpeedMs) {
            simulationSpeedMs = newSpeedValue;
            console.log(`Simulation speed updated to: ${simulationSpeedMs}ms`);

            // If running, restart the timer with the new speed
            if (simulationActive) {
                clearInterval(generationTimerId);
                generationTimerId = setInterval(() => simulationCore.advanceToNextGeneration(), simulationSpeedMs);
            }
        } else {
            console.log("Speed already at boundary, no further change applied.");
        }
    }

    function clearGrid() {
        let cellsResetCount = 0;
        for (let h = 0; h < gridWidthCount; h++) {
            for (let v = 0; v < gridHeightCount; v++) {
                if (currentGenerationState[h][v]) {
                    cellsResetCount++;
                }
                currentGenerationState[h][v] = false;
                nextGenerationBuffer[h][v] = false; // Also clear the buffer
            }
        }
        visualRenderer.renderAllCells(); // Redraw the empty grid
        console.log(`Grid cleared. ${cellsResetCount} live cells were reset.`);
    }

    return {
        gridHeight: gridHeightCount,
        gridWidth: gridWidthCount,
        currentGenerationState: currentGenerationState,
        nextGenerationBuffer: nextGenerationBuffer,
        simulationSpeedMs: simulationSpeedMs,
        setupGameGrid: setupGameGrid,
        advanceToNextGeneration: advanceToNextGeneration,
        toggleSimulationState: toggleSimulationState,
        getSimulationStatus: getSimulationStatus,
        clearGrid: clearGrid,
        modifySimulationSpeed: modifySimulationSpeed,
        loadPatternFromRLE: loadPatternFromRLE
    };
}());