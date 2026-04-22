class AutomataEngine {
    #hostElement;
    #svgElement;
    #cellPixelSize;
    #liveCellColor;
    #deadCellColor;
    #gridLineColor;
    #gridColumns;
    #gridRows;
    #currentLiveCells = new Set(); // Stores "x,y" strings for live cells
    #cellRectElements = new Map(); // Maps "x,y" to its <rect> SVG element
    #simulationTimerId = null;
    #isSimulationRunning = false;
    #evolutionSpeedMs = 100;
    #pointerDownState = { active: false, initialCellState: null, lastCoord: null };

    // Private helper for coordinate string conversion
    #coordStr = (x, y) => `${x},${y}`;
    #parseCoordStr = (str) => {
        const parts = str.split(',');
        return { x: parseInt(parts[0], 10), y: parseInt(parts[1], 10) };
    };

    constructor(containerId, initialCellSize = 10, activeColor = 'rgb(0, 0, 0)', inactiveColor = 'rgb(255, 255, 255)', gridColor = 'rgb(50, 50, 50)') {
        this.#hostElement = document.getElementById(containerId);
        if (!this.#hostElement) {
            throw new Error(`Container element with ID '${containerId}' not found.`);
        }

        this.#cellPixelSize = initialCellSize;
        this.#liveCellColor = activeColor;
        this.#deadCellColor = inactiveColor;
        this.#gridLineColor = gridColor;

        this.#initializeDisplay(this.#hostElement.offsetWidth, this.#hostElement.offsetHeight);
        this.#attachInteractionHandlers();
    }

    #initializeDisplay(widthPx, heightPx) {
        if (this.#svgElement) {
            this.#svgElement.remove(); // Clear previous SVG if re-initializing
            this.#currentLiveCells.clear();
            this.#cellRectElements.clear();
        }

        this.#svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.#svgElement.setAttribute('width', widthPx);
        this.#svgElement.setAttribute('height', heightPx);
        this.#hostElement.appendChild(this.#svgElement);

        this.#gridColumns = Math.floor((widthPx - 1) / this.#cellPixelSize);
        this.#gridRows = Math.floor((heightPx - 1) / this.#cellPixelSize);

        // Create cell rectangles
        for (let col = 0; col < this.#gridColumns; col++) {
            for (let row = 0; row < this.#gridRows; row++) {
                const cellRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                cellRect.setAttribute('x', col * this.#cellPixelSize + 1);
                cellRect.setAttribute('y', row * this.#cellPixelSize + 1);
                cellRect.setAttribute('width', this.#cellPixelSize - 1);
                cellRect.setAttribute('height', this.#cellPixelSize - 1);
                cellRect.setAttribute('fill', this.#deadCellColor);
                this.#svgElement.appendChild(cellRect);
                this.#cellRectElements.set(this.#coordStr(col, row), cellRect);
            }
        }

        // Draw grid lines
        const gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gridGroup.setAttribute('stroke', this.#gridLineColor);
        gridGroup.setAttribute('stroke-width', '1');

        for (let col = 0; col < this.#gridColumns; col++) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute('x1', col * this.#cellPixelSize);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', col * this.#cellPixelSize);
            line.setAttribute('y2', this.#gridRows * this.#cellPixelSize);
            gridGroup.appendChild(line);
        }
        for (let row = 0; row < this.#gridRows; row++) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute('x1', 0);
            line.setAttribute('y1', row * this.#cellPixelSize);
            line.setAttribute('x2', this.#gridColumns * this.#cellPixelSize);
            line.setAttribute('y2', row * this.#cellPixelSize);
            gridGroup.appendChild(line);
        }
        this.#svgElement.appendChild(gridGroup);
    }

    #updateCellVisual(x, y, isAlive) {
        const key = this.#coordStr(x, y);
        const cellRect = this.#cellRectElements.get(key);
        if (cellRect) {
            cellRect.setAttribute('fill', isAlive ? this.#liveCellColor : this.#deadCellColor);
        }
    }

    #getGridCoordinatesFromEvent(event) {
        const svgRect = this.#svgElement.getBoundingClientRect();
        const clientX = event.clientX;
        const clientY = event.clientY;

        const x = Math.floor((clientX - svgRect.left) / this.#cellPixelSize);
        const y = Math.floor((clientY - svgRect.top) / this.#cellPixelSize);

        if (x >= 0 && x < this.#gridColumns && y >= 0 && y < this.#gridRows) {
            return { x, y };
        }
        return null;
    }

    #toggleCellInteraction(event) {
        const cellCoords = this.#getGridCoordinatesFromEvent(event);
        if (!cellCoords) return;

        const { x, y } = cellCoords;
        const currentCoordStr = this.#coordStr(x, y);

        if (this.#pointerDownState.lastCoord === currentCoordStr) {
            return; // Avoid toggling multiple times on same cell during drag
        }

        if (this.#pointerDownState.initialCellState === null) {
            // First click/drag on a cell, determine its initial state to flip
            this.#pointerDownState.initialCellState = !this.#currentLiveCells.has(currentCoordStr);
        }

        if (this.#pointerDownState.initialCellState) {
            this.#currentLiveCells.add(currentCoordStr);
        } else {
            this.#currentLiveCells.delete(currentCoordStr);
        }
        this.#updateCellVisual(x, y, this.#pointerDownState.initialCellState);
        this.#pointerDownState.lastCoord = currentCoordStr;
    }

    #attachInteractionHandlers() {
        this.#svgElement.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left mouse button
                this.#pointerDownState.active = true;
                this.#pointerDownState.initialCellState = null; // Reset for new click/drag
                this.#pointerDownState.lastCoord = null;
                this.#toggleCellInteraction(e);
            }
        });

        this.#svgElement.addEventListener('mousemove', (e) => {
            if (this.#pointerDownState.active) {
                this.#toggleCellInteraction(e);
            }
        });

        // Use document for mouseup to catch releases outside the SVG
        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.#pointerDownState.active = false;
            }
        });
    }

    #getAdjacentCellCoords(x, y) {
        const neighbors = [];
        const offsets = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0],           [1, 0],
            [-1, 1], [0, 1], [1, 1]
        ];

        for (const [dx, dy] of offsets) {
            let nx = (x + dx + this.#gridColumns) % this.#gridColumns;
            let ny = (y + dy + this.#gridRows) % this.#gridRows;
            neighbors.push(this.#coordStr(nx, ny));
        }
        return neighbors;
    }

    #evaluateLiveNeighborCount(x, y) {
        return this.#getAdjacentCellCoords(x, y)
                   .filter(coord => this.#currentLiveCells.has(coord))
                   .length;
    }

    #advanceGeneration() {
        const nextGenerationLiveCells = new Set();
        const cellsToConsider = new Set(this.#currentLiveCells); // Start with all currently live cells

        // Add all neighbors of live cells to consider, as they might become alive
        for (const liveCellCoord of this.#currentLiveCells) {
            const { x, y } = this.#parseCoordStr(liveCellCoord);
            for (const neighborCoord of this.#getAdjacentCellCoords(x, y)) {
                cellsToConsider.add(neighborCoord);
            }
        }

        const cellsTurnedOff = new Set(this.#currentLiveCells);
        const cellsTurnedOn = new Set();

        for (const cellCoord of cellsToConsider) {
            const { x, y } = this.#parseCoordStr(cellCoord);
            const currentlyActive = this.#currentLiveCells.has(cellCoord);
            const liveNeighbors = this.#evaluateLiveNeighborCount(x, y);
            let willBeActive = currentlyActive;

            // Conway's Game of Life rules
            // 1. Any live cell with fewer than two live neighbours dies, as if by underpopulation.
            // 2. Any live cell with two or three live neighbours lives on to the next generation.
            // 3. Any live cell with more than three live neighbours dies, as if by overpopulation.
            // 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
            if (currentlyActive) {
                if (liveNeighbors < 2 || liveNeighbors > 3) {
                    willBeActive = false;
                }
            } else { // Currently dead
                if (liveNeighbors === 3) {
                    willBeActive = true;
                }
            }

            if (willBeActive) {
                nextGenerationLiveCells.add(cellCoord);
                if (!currentlyActive) {
                    cellsTurnedOn.add(cellCoord);
                }
            } else {
                if (currentlyActive) {
                    cellsTurnedOff.add(cellCoord);
                }
            }
        }

        // Update visuals for changed cells
        for (const cellCoord of cellsTurnedOn) {
            const { x, y } = this.#parseCoordStr(cellCoord);
            this.#updateCellVisual(x, y, true);
        }
        for (const cellCoord of cellsTurnedOff) {
            if (!nextGenerationLiveCells.has(cellCoord)) { // Only turn off if not re-activated in this generation
                const { x, y } = this.#parseCoordStr(cellCoord);
                this.#updateCellVisual(x, y, false);
            }
        }

        this.#currentLiveCells = nextGenerationLiveCells;
    }

    // Public methods
    initiateEvolution() {
        if (!this.#isSimulationRunning) {
            this.#isSimulationRunning = true;
            this.#simulationTimerId = setInterval(() => this.#advanceGeneration(), this.#evolutionSpeedMs);
        }
    }

    haltEvolution() {
        if (this.#isSimulationRunning) {
            this.#isSimulationRunning = false;
            clearInterval(this.#simulationTimerId);
            this.#simulationTimerId = null;
        }
    }

    toggleEvolutionState() {
        if (this.#isSimulationRunning) {
            this.haltEvolution();
        } else {
            this.initiateEvolution();
        }
    }

    isEvolving() {
        return this.#isSimulationRunning;
    }

    adjustEvolutionSpeed(accelerate) {
        const step = 10;
        const minSpeed = 10;
        const maxSpeed = 1000;

        if (accelerate) {
            this.#evolutionSpeedMs = Math.max(minSpeed, this.#evolutionSpeedMs - step);
        } else {
            this.#evolutionSpeedMs = Math.min(maxSpeed, this.#evolutionSpeedMs + step);
        }

        if (this.#isSimulationRunning) {
            this.haltEvolution();
            this.initiateEvolution();
        }
    }

    clearGrid() {
        this.haltEvolution();
        for (const coord of this.#currentLiveCells) {
            const { x, y } = this.#parseCoordStr(coord);
            this.#updateCellVisual(x, y, false);
        }
        this.#currentLiveCells.clear();
    }

    loadRLEPattern(patternUrl) {
        this.haltEvolution();
        this.clearGrid(); // Clear current state before loading new pattern

        fetch(patternUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                const match = data.match(/x\s*=\s*(\d+)\s*,\s*y\s*=\s*(\d+).*?\r?\n([^]*)!/);
                if (!match) {
                    throw new Error("Invalid RLE pattern format.");
                }

                const patternWidth = parseInt(match[1], 10);
                const patternHeight = parseInt(match[2], 10);
                const rleData = match[3].replace(/\s+/g, ""); // Remove whitespace

                const padding = 30; // Original code used 30
                const requiredWidthPx = (patternWidth + padding * 2) * this.#cellPixelSize;
                const requiredHeightPx = (patternHeight + padding * 2) * this.#cellPixelSize;

                // Resize and re-initialize if necessary
                if (this.#svgElement.width.baseVal.value < requiredWidthPx || this.#svgElement.height.baseVal.value < requiredHeightPx) {
                    this.#initializeDisplay(requiredWidthPx, requiredHeightPx);
                    // Re-attach handlers if SVG was replaced (because the old SVG element is removed)
                    this.#attachInteractionHandlers();
                }

                let currentX = padding;
                let currentY = padding;
                let runLength = 1;

                const processSegment = (segment) => {
                    const firstChar = segment.charAt(0);
                    let remainder = '';

                    if (!isNaN(parseInt(firstChar, 10))) {
                        // It's a run length
                        const numMatch = segment.match(/^(\d+)/);
                        runLength = parseInt(numMatch[1], 10);
                        remainder = segment.substring(numMatch[1].length);
                    } else {
                        // No explicit run length, default to 1
                        runLength = 1;
                        remainder = segment;
                    }

                    const char = remainder.charAt(0);
                    remainder = remainder.substring(1);

                    for (let i = 0; i < runLength; i++) {
                        if (char === 'o') {
                            this.#currentLiveCells.add(this.#coordStr(currentX, currentY));
                        } else if (char === 'b') {
                            // Dead cell, do nothing for the Set
                        } else if (char === '$') {
                            currentY++;
                            currentX = padding;
                            runLength = 1; // Reset run length for new line
                            return remainder; // Stop processing this segment, move to next line
                        }
                        currentX++;
                    }
                    runLength = 1; // Reset run length after processing
                    return remainder;
                };

                let remainingRle = rleData;
                while (remainingRle.length > 0 && remainingRle.charAt(0) !== '!') {
                    remainingRle = processSegment(remainingRle);
                }

                this.#currentLiveCells.forEach(coord => {
                    const { x, y } = this.#parseCoordStr(coord);
                    this.#updateCellVisual(x, y, true);
                });
            })
            .catch(error => console.error("Failed to load RLE pattern:", error));
    }
}