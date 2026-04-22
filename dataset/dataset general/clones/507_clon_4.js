const GRID_CELL_WIDTH = 100;
const GRID_CELL_HEIGHT = 100;
const NUMBER_OF_PARALLEL_SIMULATIONS = 24;

let currentGenStates; 
let nextGenStates;    

let displayCanvas;
let displayContext;
let simulationCycleHandle;
let simulationActive = false;

let currentCellDimension; 
let lastMouseGridCol = -1;
let lastMouseGridRow = -1;
let isDrawingEnabled = false;
let isMouseButtonDown = false;
let activeDrawingColor = { r: 0, g: 0, b: 0 };

function initializeSimulationGrids() {
    currentGenStates = Array(NUMBER_OF_PARALLEL_SIMULATIONS).fill(null).map(() =>
        Array(GRID_CELL_HEIGHT).fill(null).map(() =>
            Array(GRID_CELL_WIDTH).fill(0)
        )
    );
    nextGenStates = Array(NUMBER_OF_PARALLEL_SIMULATIONS).fill(null).map(() =>
        Array(GRID_CELL_HEIGHT).fill(null).map(() =>
            Array(GRID_CELL_WIDTH).fill(0)
        )
    );
}

function calculateCellDimension() {
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;
    return Math.max(
        Math.ceil(availableWidth / GRID_CELL_WIDTH),
        Math.ceil(availableHeight / GRID_CELL_HEIGHT)
    );
}

function setCellCompositeState(targetGrid, row, col, redVal, greenVal, blueVal) {
    const compositeColorValue = ~((redVal << 16) + (greenVal << 8) + blueVal) & 0xffffff;

    for (let gameIdx = 0; gameIdx < NUMBER_OF_PARALLEL_SIMULATIONS; gameIdx++) {
        const bitState = (compositeColorValue >> gameIdx) & 1;
        targetGrid[gameIdx][row][col] = bitState;
    }
}

function renderGrid() {
    const newCellDimension = calculateCellDimension();
    const currentCanvasWidth = window.innerWidth;
    const currentCanvasHeight = window.innerHeight;

    if (displayCanvas.width !== currentCanvasWidth || displayCanvas.height !== currentCanvasHeight) {
        displayCanvas.setAttribute('width', currentCanvasWidth);
        displayCanvas.setAttribute('height', currentCanvasHeight);
    }
    
    displayContext.clearRect(0, 0, currentCanvasWidth, currentCanvasHeight);

    for (let row = 0; row < GRID_CELL_HEIGHT; row++) {
        for (let col = 0; col < GRID_CELL_WIDTH; col++) {
            let combinedStateBits = 0;
            for (let gameIdx = 0; gameIdx < NUMBER_OF_PARALLEL_SIMULATIONS; gameIdx++) {
                if (currentGenStates[gameIdx][row][col] === 1) {
                    combinedStateBits |= (1 << gameIdx);
                }
            }

            const displayedColorValue = (~combinedStateBits) & 0xffffff;
            const r = (displayedColorValue >> 16) & 0xff;
            const g = (displayedColorValue >> 8) & 0xff;
            const b = (displayedColorValue >> 0) & 0xff;

            displayContext.fillStyle = `rgb(${r},${g},${b})`;
            displayContext.fillRect(
                col * newCellDimension,
                row * newCellDimension,
                newCellDimension,
                newCellDimension
            );
        }
    }
    currentCellDimension = newCellDimension;
}

function resetSimulation() {
    for (let gameIdx = 0; gameIdx < NUMBER_OF_PARALLEL_SIMULATIONS; gameIdx++) {
        for (let row = 0; row < GRID_CELL_HEIGHT; row++) {
            currentGenStates[gameIdx][row].fill(0);
        }
    }
    renderGrid();
}

function initializeRandomColors() {
    for (let row = 0; row < GRID_CELL_HEIGHT; row++) {
        for (let col = 0; col < GRID_CELL_WIDTH; col++) {
            const r = Math.round(Math.random() * 255);
            const g = Math.round(Math.random() * 255);
            const b = Math.round(Math.random() * 255);
            setCellCompositeState(currentGenStates, row, col, r, g, b);
        }
    }
    renderGrid();
}

function advanceGeneration() {
    for (let gameIdx = 0; gameIdx < NUMBER_OF_PARALLEL_SIMULATIONS; gameIdx++) {
        for (let row = 0; row < GRID_CELL_HEIGHT; row++) {
            for (let col = 0; col < GRID_CELL_WIDTH; col++) {
                let liveNeighbors = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) { continue; }

                        const nRow = (row + dr + GRID_CELL_HEIGHT) % GRID_CELL_HEIGHT;
                        const nCol = (col + dc + GRID_CELL_WIDTH) % GRID_CELL_WIDTH;

                        if (currentGenStates[gameIdx][nRow][nCol] === 1) {
                            liveNeighbors++;
                        }
                    }
                }

                const currentCellState = currentGenStates[gameIdx][row][col];
                let nextState = 0;

                if (currentCellState === 1) {
                    if (liveNeighbors === 2 || liveNeighbors === 3) {
                        nextState = 1;
                    }
                } else {
                    if (liveNeighbors === 3) {
                        nextState = 1;
                    }
                }
                nextGenStates[gameIdx][row][col] = nextState;
            }
        }
    }

    const tempGrid = currentGenStates;
    currentGenStates = nextGenStates;
    nextGenStates = tempGrid;

    renderGrid();
}

function applyPatternCells(coordinates, red, green, blue) {
    coordinates.forEach(coords => {
        setCellCompositeState(currentGenStates, coords[1], coords[0], red, green, blue);
    });
}

function loadPattern(patternIndex = 0) {
    resetSimulation();
    switch (patternIndex) {
        case 0:
            applyPatternCells([[41,23], [42,23], [43,23], [44,23], [45,23], [46,23], [47,23], [48,23],
                               [41,26], [42,26], [43,26], [44,26], [45,26], [46,26], [47,26], [48,26]], 54, 99, 204);
            applyPatternCells([[41,22], [42,22], [43,22], [44,22], [45,22], [46,22], [47,22], [48,22],
                               [41,27], [42,27], [43,27], [44,27], [45,27], [46,27], [47,27], [48,27]], 40, 187, 130);
            applyPatternCells([[41,21], [42,21], [43,21], [44,21], [45,21], [46,21], [47,21], [48,21],
                               [41,28], [42,28], [43,28], [44,28], [45,28], [46,28], [47,28], [48,28]], 170, 37, 37);
            break;

        case 1:
            applyPatternCells([[25,25], [26,25], [27,25], [28,25], [29,25], [30,25], [31,25], [32,25],
                               [34,25], [35,25], [36,25], [37,25], [38,25], [42,25], [43,25], [44,25],
                               [51,25], [52,25], [53,25], [54,25], [55,25], [56,25], [57,25], [59,25],
                               [60,25], [61,25], [62,25], [63,25]], 25, 57, 150);
            applyPatternCells([[25,26], [26,26], [27,26], [28,26], [29,26], [30,26], [31,26], [32,26],
                               [34,26], [35,26], [36,26], [37,26], [38,26], [42,26], [43,26], [44,26],
                               [51,26], [52,26], [53,26], [54,26], [55,26], [56,26], [57,26], [59,26],
                               [60,26], [61,26], [62,26], [63,26]], 57, 150, 25);
            applyPatternCells([[25,27], [26,27], [27,27], [28,27], [29,27], [30,27], [31,27], [32,27],
                               [34,27], [35,27], [36,27], [37,27], [38,27], [42,27], [43,27], [44,27],
                               [51,27], [52,27], [53,27], [54,27], [55,27], [56,27], [57,27], [59,27],
                               [60,27], [61,27], [62,27], [63,27]], 150, 57, 25);
            break;

        case 3:
            applyPatternCells([[0, 1],[1,2],[2,0],[2,1],[2,2]], 0, 0, 0);
            break;
    }
    renderGrid();
}

function getMouseGridPosition(event) {
    const canvasRect = displayCanvas.getBoundingClientRect();
    const clientX = event.clientX - canvasRect.left;
    const clientY = event.clientY - canvasRect.top;

    const col = Math.floor(clientX / currentCellDimension);
    const row = Math.floor(clientY / currentCellDimension);
    return { row, col };
}

function handleDrawStart(event) {
    isMouseButtonDown = true;
    const pos = getMouseGridPosition(event);
    if (pos.row >= 0 && pos.row < GRID_CELL_HEIGHT && pos.col >= 0 && pos.col < GRID_CELL_WIDTH) {
        setCellCompositeState(currentGenStates, pos.row, pos.col,
                             activeDrawingColor.r, activeDrawingColor.g, activeDrawingColor.b);
        if (!simulationActive) { renderGrid(); }
    }
    lastMouseGridRow = pos.row;
    lastMouseGridCol = pos.col;
}

function handleDrawEnd() {
    isMouseButtonDown = false;
    lastMouseGridRow = -1;
    lastMouseGridCol = -1;
}

function handleDrawMove(event) {
    if (isMouseButtonDown) {
        const pos = getMouseGridPosition(event);
        if (pos.row !== lastMouseGridRow || pos.col !== lastMouseGridCol) {
            if (pos.row >= 0 && pos.row < GRID_CELL_HEIGHT && pos.col >= 0 && pos.col < GRID_CELL_WIDTH) {
                setCellCompositeState(currentGenStates, pos.row, pos.col,
                                     activeDrawingColor.r, activeDrawingColor.g, activeDrawingColor.b);
                if (!simulationActive) { renderGrid(); }
            }
            lastMouseGridRow = pos.row;
            lastMouseGridCol = pos.col;
        }
    }
}

function toggleDrawingMode() {
    isDrawingEnabled = !isDrawingEnabled;
    const canvasElement = document.getElementById('main-display-surface');
    const drawingButton = document.getElementById('draw-tool-button');
    const colorInput = document.getElementById('color-selection-input');

    if (isDrawingEnabled) {
        canvasElement.addEventListener('mousedown', handleDrawStart);
        canvasElement.addEventListener('mousemove', handleDrawMove);
        canvasElement.addEventListener('mouseup', handleDrawEnd);
        canvasElement.classList.add('drawing-cursor');
        drawingButton.classList.add('selected-tool');
        if (colorInput) colorInput.style.display = 'block';
    } else {
        canvasElement.removeEventListener('mousedown', handleDrawStart);
        canvasElement.removeEventListener('mousemove', handleDrawMove);
        canvasElement.removeEventListener('mouseup', handleDrawEnd);
        canvasElement.classList.remove('drawing-cursor');
        drawingButton.classList.remove('selected-tool');
        if (colorInput) colorInput.style.display = 'none';
    }
}

function startSimulation() {
    simulationActive = true;
    simulationCycleHandle = setInterval(advanceGeneration, 100);
    document.getElementById('start-button').style.display = 'none';
    document.getElementById('pause-button').style.display = 'inline-block';
}

function pauseSimulation() {
    simulationActive = false;
    clearInterval(simulationCycleHandle);
    document.getElementById('start-button').style.display = 'inline-block';
    document.getElementById('pause-button').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    displayCanvas = document.getElementById('main-display-surface');
    displayContext = displayCanvas.getContext('2d');

    initializeSimulationGrids();

    document.getElementById('draw-tool-button').addEventListener('click', toggleDrawingMode);
    
    const colorInputElement = document.createElement('input');
    colorInputElement.type = 'color';
    colorInputElement.id = 'color-selection-input';
    colorInputElement.style.position = 'absolute';
    colorInputElement.style.top = '10px';
    colorInputElement.style.left = '150px';
    colorInputElement.value = `#000000`;
    colorInputElement.style.display = 'none';
    colorInputElement.addEventListener('change', (event) => {
        const hex = event.target.value;
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        activeDrawingColor = { r, g, b };
    });
    document.body.appendChild(colorInputElement);

    document.getElementById('start-button').addEventListener('click', startSimulation);
    document.getElementById('pause-button').addEventListener('click', pauseSimulation);
    document.getElementById('pause-button').style.display = 'none';

    window.addEventListener('resize', () => {
        if (!simulationActive) { renderGrid(); }
    });

    resetSimulation();
    initializeRandomColors();
    startSimulation();
});